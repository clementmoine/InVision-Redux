import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Code2, Eye, Share, Workflow } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Hotspot from '@/components/Hotspot';

import EmptyState from '@/assets/illustrations/empty-state.svg?react';

import { getScreen } from '@/api/screens';

function Screen() {
  const [showHotspots, setShowHotspots] = useState(false);
  const timeoutRef = useRef<number>();

  const navigate = useNavigate();
  const params = useParams();

  const {
    data: screenProject,
    isFetching,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['projects', Number(params.projectId), Number(params.screenId)],
    queryFn: getScreen,
    placeholderData: keepPreviousData,
  });

  const [zoomLevel] = useState<number>(2);

  const screen = useMemo(() => {
    if (screenProject) {
      return screenProject.activeScreens.find(
        activeScreen => activeScreen.id === screenProject.screenID,
      );
    }
  }, [screenProject]);

  const screens = useMemo(() => {
    if (screenProject) {
      return screenProject.activeScreens.sort((a, b) => a.sort - b.sort);
    }
  }, [screenProject]);

  const hotspots = useMemo(() => {
    if (screenProject) {
      return screenProject.hotspots;
    }
  }, [screenProject]);

  const onHotspotGroupClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const hotspotClicked =
      'hotspotId' in (e.target as HTMLDivElement | HTMLAnchorElement).dataset;

    if (!hotspotClicked) {
      setShowHotspots(true);

      // Set a delay in milliseconds (e.g., 3000 for 3 seconds)
      const delay = 500;

      // Clear any previous timeout if present
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide the hotspots after the specified delay
      timeoutRef.current = setTimeout(() => {
        setShowHotspots(false);
      }, delay);
    }
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Screen */}
      <div
        id="screen-preview"
        className="flex h-full w-full bg-muted/40 justify-center overflow-auto p-0"
      >
        {screen ? (
          <div
            className={`flex relative max-w-full max-h-full`}
            style={{
              height: screen.height / zoomLevel,
              width: screen.width / zoomLevel,
            }}
          >
            {/* Hotspots */}
            <div
              className="absolute inset-0 bg-transparent z-10"
              onClick={onHotspotGroupClick}
            >
              {hotspots?.map(hotspot => (
                <Hotspot
                  key={hotspot.id}
                  hotspot={hotspot}
                  zoomLevel={zoomLevel}
                  visible={showHotspots}
                  screens={screens}
                />
              ))}
            </div>

            {/* Image */}
            <img
              src={`/api/static/${screen.imageUrl}`}
              style={{
                minWidth: screen.width / zoomLevel,
                minHeight: screen.height / zoomLevel,
                aspectRatio: `${screen.width} / ${screen.height}`,
              }}
            />
          </div>
        ) : (
          !isFetching &&
          !isPending && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
              <EmptyState />
              <h2 className="text-2xl font-semibold tracking-tight">
                There is nothing here?
              </h2>
              <p className="text-sm text-muted-foreground">
                Huh? I thought I left that here... strange.
              </p>
              <Button className="mt-4" onClick={() => refetch()}>
                Give it another shot
              </Button>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="flex h-16 items-center border-t bg-background p-3">
        <nav className="flex flex-1 gap-1 justify-between">
          <div className="flex flex-1 items-center gap-4 justify-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
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

            <h2 className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
              {screen?.name}
            </h2>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Preview Mode"
                >
                  <Eye className="size-5" />
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
                  className="rounded-lg"
                  aria-label="Flow Mode"
                >
                  <Workflow className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Flow Mode <kbd>(F)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Inspect"
                >
                  <Code2 className="size-5" />
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
                  className="rounded-lg"
                  aria-label="History Mode"
                >
                  <Clock className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                History Mode <kbd>(M)</kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-end">
            <Button
              variant="default"
              className="rounded-lg gap-2"
              aria-label="Back"
            >
              <Share className="size-5" />
              Share
            </Button>
          </div>
        </nav>
      </footer>
    </div>
  );
}
Screen.displayName = 'Screen';

export { Screen };
