import { cn } from '@/lib/utils';
import Hotkeys from 'react-hot-keys';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Eye,
  Share,
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Zoom from '@/components/Zoom';
import { Toaster } from '@/components/ui/sonner';
import MiniPagination from '@/components/MiniPagination';
import ConversationToggle from '@/components/ConversationToggle';

import NotFound from '@/assets/illustrations/not-found.svg?react';
import ToDo from '@/assets/illustrations/to-do.svg?react';

import Preview from '@/views/Screen/Preview/Preview';
import Inspect from '@/views/Screen/Inspect/Inspect';
import History from '@/views/Screen/History/History';

import { getScreen } from '@/api/screens';

import { ArchivedScreenDetails, Screen as ScreenType } from '@/types';

import { copyToClipboard, hexToRgb } from '@/utils';

import defaultValues from '@/constants/defaultValues';

import useLocalStorage from '@/hooks/useLocalStorage';

import { ThumbnailTray } from './ThumbnailTray';

import style from './Screen.module.scss';

function Screen() {
  const params = useParams();
  const navigate = useNavigate();

  const [showConversations, setShowConversations] = useState<boolean | 'all'>(
    true,
  );
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(0);

  const { onChange } = useLocalStorage('inspect_panels');

  useEffect(() => {
    onChange((_, value) => {
      const parsedValue = JSON.parse(value || '{}');
      const layout = (
        (Object.values(parsedValue)?.[0] as { layout: number[] }) || undefined
      )?.layout;

      setRightPanelWidth(layout[2]);
    });
  }, [onChange]);

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['projects', Number(params.projectId), Number(params.screenId)],
    queryFn: getScreen,
    placeholderData: keepPreviousData,
  });

  const allScreens = useMemo(
    () =>
      data != null && 'activeScreens' in data
        ? data.activeScreens.sort((a, b) => a.sort - b.sort)
        : undefined,
    [data],
  );

  const conversations = useMemo(
    () =>
      data != null && 'activeScreens' in data ? data.conversations : undefined,
    [data],
  );

  const screenIndex = useMemo(
    () =>
      allScreens?.findIndex(screen => screen.id === Number(params.screenId)),
    [allScreens, params.screenId],
  );

  const screen = useMemo<
    ArchivedScreenDetails['screen'] | ScreenType | undefined
  >(
    () =>
      data
        ? 'activeScreens' in data
          ? screenIndex != null
            ? allScreens![screenIndex]
            : undefined
          : data.screen
        : undefined,
    [data, screenIndex, allScreens],
  );

  const allHotspots = useMemo(
    () =>
      (params.mode ?? 'preview') === 'preview' &&
      data != null &&
      'allHotspots' in data
        ? data.allHotspots
        : undefined,
    [data, params.mode],
  );

  const hotspots = useMemo(
    () =>
      (params.mode ?? 'preview') === 'preview'
        ? data != null && 'hotspots' in data
          ? data.hotspots
          : undefined
        : [],
    [data, params.mode],
  );

  const preloadImageUrls = useMemo(() => {
    const imageUrls = new Set<string>();

    if (allScreens && allScreens.length > 0 && screenIndex != null) {
      if (hotspots && hotspots.length > 0) {
        hotspots.forEach(hotspot => {
          if (hotspot.targetScreenID) {
            const targetScreen = allScreens.find(
              screen => screen.id === hotspot.targetScreenID,
            );

            if (targetScreen && targetScreen.imageUrl) {
              imageUrls.add(targetScreen.imageUrl);
            }
          }
        });
      }

      const nextIndex =
        screenIndex < allScreens.length - 1 ? screenIndex + 1 : 0;

      if (nextIndex !== null) {
        const nextScreen = allScreens[nextIndex];

        if (nextScreen && nextScreen.imageUrl) {
          imageUrls.add(nextScreen.imageUrl);
        }
      }

      const previousIndex =
        screenIndex > 0 ? screenIndex - 1 : allScreens.length - 1;

      if (previousIndex !== null) {
        const previousScreen = allScreens[previousIndex];

        if (previousScreen && previousScreen.imageUrl) {
          imageUrls.add(previousScreen.imageUrl);
        }
      }
    }

    return Array.from(imageUrls);
  }, [allScreens, hotspots, screenIndex]);

  const isMobile = useMemo(
    () =>
      params.mode === 'preview' &&
      data != null &&
      'isMobile' in data.project &&
      data.project.isMobile,
    [data, params.mode],
  );

  const [zoomLevel, setZoomLevel] = useState<number>(defaultValues.initialZoom);

  const screenBackgroundColor = useMemo(() => {
    if (screen) {
      const color = hexToRgb(
        'backgroundColor' in screen && screen.backgroundColor
          ? screen.backgroundColor
          : '#fff',
      );

      if (color != null) {
        return `${color.r} ${color.g} ${color.b}`;
      }
    }

    return '255 255 255';
  }, [screen]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!allScreens) {
        return;
      }

      const targetScreen = allScreens[page - 1];

      navigate(
        `/projects/${params.projectId}/${targetScreen.id}/${params.mode ?? 'preview'}`,
        {
          state: {
            previousScreenId: params.screenId?.toString(),
          },
        },
      );
    },
    [allScreens, navigate, params],
  );

  const handleEnableConversations = useCallback(
    (checked: boolean, showAll: boolean) => {
      setShowConversations(() => (checked && showAll ? 'all' : checked));
    },
    [],
  );

  return (
    <div
      id="screen"
      className="flex h-screen w-full flex-col overflow-hidden bg-muted"
      style={{ ['--screen-background-color']: screenBackgroundColor }}
    >
      <Toaster
        position="top-right"
        style={{
          transform:
            params.mode === 'inspect'
              ? `translateX(-${rightPanelWidth}vw)`
              : undefined,
        }}
      />

      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        {/* Screen */}
        <div
          id="screen-container"
          className={cn(
            'flex h-full w-full justify-center overflow-hidden p-0 select-none mb-16',
            { [style['is-mobile']]: isMobile },
          )}
          style={{
            backgroundColor:
              params.mode === 'preview'
                ? 'rgb(var(--screen-background-color))'
                : undefined,
          }}
        >
          {screen && params.projectId && params.screenId ? (
            <>
              {/* Helmet title */}
              <Helmet>
                <title>{screen.name} - InVision</title>

                {/* Preload previous and next image */}
                {preloadImageUrls?.map(imageUrl => (
                  <link
                    key={imageUrl}
                    rel="preload"
                    as="image"
                    href={imageUrl}
                  />
                ))}
              </Helmet>

              {(params.mode ?? 'preview') === 'preview' && (
                <Preview
                  zoomLevel={zoomLevel}
                  screen={screen}
                  hotspots={hotspots}
                  allScreens={allScreens}
                  allHotspots={allHotspots}
                  conversations={conversations}
                  screenId={Number(params.screenId)}
                  projectId={Number(params.projectId)}
                  showConversations={showConversations}
                />
              )}

              {(params.mode ?? 'preview') === 'history' && (
                <History
                  screen={screen}
                  zoomLevel={zoomLevel}
                  screenId={Number(params.screenId)}
                  projectId={Number(params.projectId)}
                />
              )}

              {(params.mode ?? 'preview') === 'inspect' && (
                <Inspect
                  zoomLevel={zoomLevel}
                  screen={screen}
                  allScreens={allScreens}
                  conversations={conversations}
                  screenId={Number(params.screenId)}
                  projectId={Number(params.projectId)}
                  showConversations={showConversations}
                />
              )}

              {/* Work in progress for tabs not developed yet */}
              {!['preview', 'inspect', 'history'].includes(
                params.mode ?? 'preview',
              ) && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <ToDo />

                  <h2 className="text-2xl font-semibold tracking-tight">
                    Work in progress
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Huh? Magician never reveals his secret come back later!...
                  </p>

                  <Button
                    className="mt-4"
                    onClick={() =>
                      navigate(
                        `/projects/${params.projectId}/${params.screenId}/preview`,
                      )
                    }
                  >
                    Go back to a safe place
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Screen not found
            !isFetching &&
            !isPending && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                <NotFound />

                <h2 className="text-2xl font-semibold tracking-tight">
                  Nothing to see here!
                </h2>

                <p className="text-sm text-muted-foreground">
                  Lost your way, hooman? Time to paws and rethink! 🐾
                </p>

                <Button
                  onClick={() => navigate(`/projects/${params.projectId}`)}
                >
                  Go to the project page
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Tools */}
      <aside
        className="fixed flex bottom-20 right-4 gap-4"
        style={{
          transform:
            params.mode === 'inspect'
              ? `translateX(-${rightPanelWidth}vw)`
              : undefined,
        }}
      >
        {allScreens != null && allScreens.length > 1 && screenIndex != null && (
          <MiniPagination
            loop
            start={1}
            end={allScreens?.length}
            initialValue={screenIndex + 1}
            onChange={handlePageChange}
          />
        )}

        <Zoom
          onChange={setZoomLevel}
          initialValue={defaultValues.initialZoom}
        />
      </aside>

      {/* Tray */}
      {isTrayOpen && (
        <ThumbnailTray data={data} handleClose={() => setIsTrayOpen(false)} />
      )}

      {/* Footer */}
      <footer className="dark flex fixed bottom-0 w-full h-16 items-center border-t p-3 z-[100] overflow-hidden bg-background flex-shrink-0">
        <nav className="flex flex-1 gap-1 justify-between overflow-hidden">
          <div className="flex flex-1 overflow-hidden items-center gap-4 justify-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg flex-shrink-0 text-foreground"
                  aria-label="Back"
                  onClick={() => navigate(`/projects/${params.projectId}`)}
                >
                  <ArrowLeft className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Back
              </TooltipContent>
            </Tooltip>

            <Breadcrumb className="flex flex-1 overflow-hidden">
              <BreadcrumbList className="flex-nowrap flex-1 overflow-hidden">
                {data?.project.name && (
                  <BreadcrumbItem className="hidden overflow-hidden lg:flex">
                    <BreadcrumbLink
                      title={data?.project.name}
                      href={`/projects/${params.projectId}`}
                      className="verflow-hidden text-ellipsis break-words line-clamp-2"
                    >
                      {data?.project.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}

                {data?.project.name && screen?.name && (
                  <BreadcrumbSeparator className="hidden flex-shrink-0 lg:flex" />
                )}

                {screen?.name && (
                  <BreadcrumbItem className="hidden overflow-hidden lg:overflow-visible sm:flex">
                    <BreadcrumbPage
                      title={screen?.name}
                      className="text-nowrap overflow-hidden text-ellipsis"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            role="button"
                            className="flex gap-2 items-center"
                            onClick={() => setIsTrayOpen(o => !o)}
                          >
                            {screen?.name}

                            {isTrayOpen ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronUp className="size-3.5" />
                            )}
                          </span>
                        </TooltipTrigger>

                        <TooltipContent side="top" sideOffset={5}>
                          {isTrayOpen ? 'Close' : 'Open'} thumbnail tray
                        </TooltipContent>
                      </Tooltip>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'rounded-lg',
                    (params.mode ?? 'preview') === 'preview'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                  )}
                  aria-label="Preview Mode"
                  onClick={() =>
                    navigate(
                      `/projects/${params.projectId}/${params.screenId}/preview`,
                    )
                  }
                >
                  <Hotkeys
                    keyName="p"
                    onKeyUp={() =>
                      navigate(
                        `/projects/${params.projectId}/${params.screenId}/preview`,
                      )
                    }
                  >
                    <Eye className="size-5" />
                  </Hotkeys>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Preview Mode <kbd>(P)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Inspect"
                  className={cn(
                    'rounded-lg',
                    (params.mode ?? 'preview') === 'inspect'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                  )}
                  onClick={() =>
                    navigate(
                      `/projects/${params.projectId}/${params.screenId}/inspect`,
                    )
                  }
                >
                  <Hotkeys
                    keyName="i"
                    onKeyUp={() =>
                      navigate(
                        `/projects/${params.projectId}/${params.screenId}/inspect`,
                      )
                    }
                  >
                    <Code2 className="size-5" />
                  </Hotkeys>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Inspect <kbd>(I)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="History"
                  className={cn(
                    'rounded-lg',
                    (params.mode ?? 'preview') === 'history'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                  )}
                  onClick={() =>
                    navigate(
                      `/projects/${params.projectId}/${params.screenId}/history`,
                    )
                  }
                >
                  <Hotkeys
                    keyName="h"
                    onKeyUp={() =>
                      navigate(
                        `/projects/${params.projectId}/${params.screenId}/history`,
                      )
                    }
                  >
                    <Clock className="size-5" />
                  </Hotkeys>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                History <kbd>(H)</kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-end">
            <ConversationToggle
              totalCount={conversations?.length ?? 0}
              count={
                showConversations === 'all'
                  ? (conversations?.length ?? 0)
                  : (conversations?.filter(c => !c.isComplete).length ?? 0)
              }
              checked={!!showConversations}
              onCheckedChange={handleEnableConversations}
            />

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  className="rounded-lg gap-2"
                  aria-label="Back"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share className="size-5" />
                  Share
                </Button>
              </TooltipTrigger>

              <TooltipContent side="left" sideOffset={5}>
                Copy to clipboard
              </TooltipContent>
            </Tooltip>
          </div>
        </nav>
      </footer>
    </div>
  );
}

Screen.displayName = 'Screen';

export { Screen };
