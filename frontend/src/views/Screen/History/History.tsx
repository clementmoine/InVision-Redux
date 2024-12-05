import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';

import { getScreenHistory } from '@/api/screens';

import { ArchivedScreenDetails, Project, Screen, ScreenVersion } from '@/types';

import { getInitials, getStaticUrl, isSystemAvatar } from '@/utils';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import useLocalStorage from '@/hooks/useLocalStorage';

import style from './History.module.scss';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Blend, Columns, Fullscreen } from 'lucide-react';

interface HistoryProps {
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
}

function History(props: HistoryProps) {
  const { screen, zoomLevel } = props;

  const storage = useLocalStorage('history_panels');

  const [_selectedVersion, setSelectedVersion] = useState<ScreenVersion | null>(
    null,
  );

  const [compareMode, setCompareMode] = useState<string>('solo');

  const params = useParams();

  const { data } = useQuery({
    queryKey: [
      'projects',
      Number(params.projectId),
      Number(params.screenId),
      'history',
    ],
    queryFn: getScreenHistory,
    placeholderData: keepPreviousData,
  });

  const sortedVersions = useMemo(
    () => data?.versions.sort((a, b) => b.createdAt - a.createdAt),
    [data],
  );

  const currentVersion = useMemo(
    () =>
      sortedVersions?.find(
        version =>
          'imageVersion' in screen &&
          version &&
          version.version === screen.imageVersion &&
          version.imageUrl === screen.imageUrl,
      ),
    [sortedVersions, screen],
  );

  const selectedVersion = useMemo(
    () => _selectedVersion || sortedVersions?.[0],
    [_selectedVersion, sortedVersions],
  );

  const isCurrentVersion = useCallback(
    (version?: ScreenVersion) =>
      version &&
      currentVersion &&
      version.version === currentVersion.version &&
      version.imageUrl === currentVersion.imageUrl,
    [currentVersion],
  );

  // Reset the current version when screen changed
  useMemo(() => {
    setSelectedVersion(null);
  }, [screen.id]);

  return (
    <ResizablePanelGroup
      id="screen-versions"
      direction="horizontal"
      className="overflow-hidden"
      data-screen-id={screen.id.toString()}
      storage={storage}
      autoSaveId="versions_panels"
    >
      {/* Layers */}
      <ResizablePanel
        id="left-panel"
        minSize={20}
        maxSize={60}
        className="flex flex-col gap-4 bg-background"
      >
        <div className="flex mt-4 mx-4 h-10 items-center shrink-0">
          <h2 className="text-sm ">Versions ({data?.versions?.length ?? 0})</h2>
        </div>

        <ol className="flex flex-col gap-2 overflow-auto px-4 pb-4">
          {data?.versions.map(version => {
            const isSelected = version.version === selectedVersion?.version;

            return (
              <li key={version.screenversionid}>
                <a
                  href="#"
                  role="button"
                  onClick={() => setSelectedVersion(version)}
                  className={cn(
                    'flex flex-col gap-2 rounded-md p-2 transition-all h-full',
                    {
                      'text-muted-foreground hover:bg-stone-50 hover:text-neutral-500':
                        !isSelected,
                      'bg-primary-foreground text-primary': isSelected,
                    },
                  )}
                >
                  <span className="flex gap-2 justify-between">
                    <span className="flex gap-2 items-center">
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage
                          src={
                            isSystemAvatar(version.avatarID)
                              ? undefined
                              : getStaticUrl(version.avatarUrl)
                          }
                          alt={version.userName}
                        />

                        <AvatarFallback className="text-muted-foreground text-[12px] align-middle text-center h-full aspect-square w-auto p-0">
                          {getInitials(version.userName)}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-sm overflow-hidden text-ellipsis break-words line-clamp-2">
                        {version.userName}
                      </p>
                    </span>

                    {isCurrentVersion(version) && (
                      <span
                        className="flex shrink-0 self-start bg-current p-1 overflow-hidden w-fit rounded-sm"
                        style={{ fontSize: 10 }}
                      >
                        <span className="text-stone-50">Current</span>
                      </span>
                    )}
                  </span>

                  <span className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
                    {dayjs(version.createdAt).format('L LT')}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Screen with annotations */}
      <ResizablePanel
        id="middle-panel"
        minSize={50}
        defaultSize={75}
        data-version={selectedVersion?.version}
        className="flex justify-center relative"
      >
        {!isCurrentVersion(selectedVersion) && (
          <Tabs
            value={compareMode}
            defaultValue="solo"
            className="absolute mt-2 z-[999]"
            onValueChange={value => setCompareMode(value)}
          >
            <TabsList>
              <TabsTrigger value="solo" className="gap-1">
                <Fullscreen className="size-5" /> Solo
              </TabsTrigger>
              <TabsTrigger value="side" className="gap-1">
                <Columns className="size-5" /> Side by side
              </TabsTrigger>

              <TabsTrigger value="overlay" className="gap-1">
                <Blend className="size-5" />
                Overlay
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div
          className={cn(
            'flex w-full items-start !overflow-auto text-background bg-muted',
            style['checkerboard'],
          )}
        >
          <div
            className={cn('flex mx-auto gap-16 p-16 relative items-start', {
              invert:
                isCurrentVersion(selectedVersion) === false &&
                compareMode === 'overlay',
            })}
          >
            {/* Current version (the screen) */}
            {(compareMode !== 'solo' || isCurrentVersion(selectedVersion)) && (
              <img
                key={currentVersion?.version}
                decoding="sync"
                alt={`${screen.name} version ${currentVersion?.version}`}
                src={getStaticUrl(currentVersion?.imageUrl)}
                style={{
                  width: screen.width * zoomLevel,
                  minWidth: screen.width * zoomLevel,
                  maxWidth: screen.width * zoomLevel,
                  height: screen.height * zoomLevel,
                  minHeight: screen.height * zoomLevel,
                  maxHeight: screen.height * zoomLevel,
                }}
              />
            )}

            {/* Selected version */}
            {!isCurrentVersion(selectedVersion) && (
              <img
                key={selectedVersion?.version}
                decoding="sync"
                alt={`${screen.name} version ${selectedVersion?.version}`}
                src={getStaticUrl(selectedVersion?.imageUrl)}
                className={cn('h-auto ', {
                  absolute: compareMode === 'overlay',
                  'mix-blend-difference': compareMode === 'overlay',
                  'opacity-100': compareMode === 'overlay',
                  'object-contain': compareMode === 'overlay',
                  'object-top': compareMode === 'overlay',
                })}
                style={{
                  width: screen.width * zoomLevel,
                  minWidth: screen.width * zoomLevel,
                  maxWidth: screen.width * zoomLevel,
                  height:
                    compareMode === 'overlay'
                      ? screen.height * zoomLevel
                      : undefined,
                  minHeight:
                    compareMode === 'overlay'
                      ? screen.height * zoomLevel
                      : undefined,
                  maxHeight:
                    compareMode === 'overlay'
                      ? screen.height * zoomLevel
                      : undefined,
                  backgroundImage: `url("${getStaticUrl(currentVersion?.imageUrl)}")`,
                  backgroundSize: 'cover',
                }}
              />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
History.displayName = 'History';

export default History;
