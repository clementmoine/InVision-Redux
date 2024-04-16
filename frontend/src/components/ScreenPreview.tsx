import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { MouseEvent, useCallback, useRef, useState, useMemo } from 'react';

import Hotspot from '@/components/Hotspot';
import { Button } from '@/components/ui/button';

import EmptyState from '@/assets/illustrations/empty-state.svg?react';

import { getScreen } from '@/api/screens';

import { HotspotWithMetadata, Project, Screen, TargetType } from '@/types';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { targetTypes } from '@/constants/hotspots';

interface ScreenPreviewProps {
  isEmbedded?: boolean;
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
}

function ScreenPreview(props: ScreenPreviewProps) {
  const { isEmbedded = false, screenId, projectId, zoomLevel } = props;

  const ref = useRef<HTMLDivElement>(null);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const timeoutRef = useRef<number>();
  const [showHotspots, setShowHotspots] = useState(false);

  const { data, isFetching, isPending, refetch } = useQuery({
    queryKey: ['projects', projectId, screenId],
    queryFn: getScreen,
    placeholderData: keepPreviousData,
  });

  const hotspots = useMemo(() => data?.hotspots, [data]);

  const screens = useMemo(
    () => data?.activeScreens.sort((a, b) => a.sort - b.sort),
    [data],
  );

  const screen = useMemo(
    () =>
      data?.activeScreens.find(
        activeScreen => activeScreen.id === data.screenID,
      ),
    [data],
  );

  const onHotspotTrigger = useCallback(
    (id: HotspotWithMetadata['id'], targetType: TargetType) => {
      const hotspot = hotspots?.find(hotspot => hotspot.id === id);

      if (hotspot) {
        if (targetType === 'screen') {
          navigate(`/projects/${params.projectId}/${hotspot.targetScreenID}`, {
            state: {
              previousScreenId: params.screenId,
            },
          });
        } else if (targetType === 'lastScreenVisited') {
          // Navigates back to the last visited screen
          // TODO: Check if a go back then a click on another go back on the previousScreen gets back to this screen
          if (location?.state?.previousScreenId) {
            navigate(
              `/projects/${params.projectId}/${location.state.previousScreenId}`,
              {
                state: {
                  previousScreenId: params.screenId,
                },
              },
            );
          }
        } else if (
          targetType === 'previousScreenInSort' ||
          targetType === 'nextScreenInSort'
        ) {
          if (screen && screens) {
            const currentIndex = screens.findIndex(s => s.id === screen.id);

            if (currentIndex !== -1) {
              let adjacentIndex: number;

              if (targetType === 'previousScreenInSort') {
                adjacentIndex = currentIndex - 1;
              } else {
                adjacentIndex = currentIndex + 1;
              }

              if (adjacentIndex >= 0 && adjacentIndex < screens.length) {
                const adjacentScreenID = screens[adjacentIndex].id;
                navigate(`/projects/${params.projectId}/${adjacentScreenID}`, {
                  state: {
                    previousScreenId: hotspot.screenID,
                  },
                });
              }
            }
          }
        } else if (targetType === 'externalUrl') {
          // Open an url in a new tab
          const { metaData } = hotspot as HotspotWithMetadata<'externalUrl'>;
          window.open(metaData.url, '_blank', 'noopener,noreferrer,nofollow');
        } else if (targetType === 'positionOnScreen') {
          // Scroll to a position on this screen
          const { metaData } =
            hotspot as HotspotWithMetadata<'positionOnScreen'>;
          const screenPreview = ref.current;

          if (screenPreview) {
            screenPreview.scrollTo({
              top: metaData.scrollOffset,
              behavior: metaData.isSmoothScroll ? 'smooth' : 'instant',
            });
          }
        } else if (hotspot.targetTypeID === targetTypes.screenOverlay) {
          // Handle screen overlay
          // Example: Show a modal or overlay on the screen
        } else {
          alert('Unhandled target type');
        }
      }
    },
    [
      hotspots,
      location,
      navigate,
      params.projectId,
      params.screenId,
      screen,
      screens,
    ],
  );

  const onHotspotGroupClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Prevent click to be propagated to the above hotspots
      event.stopPropagation();

      const hotspotClicked =
        'hotspotid' in (event.target as HTMLElement).dataset;

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
    },
    [],
  );

  return (
    <div
      ref={ref}
      id="screen-preview"
      className="flex w-full h-full overflow-auto justify-center"
    >
      {screen ? (
        <div
          className={`flex relative max-w-full max-h-full`}
          style={{
            height: screen.height * zoomLevel,
            width: screen.width * zoomLevel,
          }}
        >
          {/* Hotspots */}
          {hotspots && (
            <div
              className="absolute inset-0 bg-transparent z-10"
              onClick={onHotspotGroupClick}
            >
              {hotspots.map(hotspot => (
                <Hotspot
                  key={`${projectId}/${screenId}/${hotspot.id}`}
                  hotspot={hotspot}
                  screenID={screenId}
                  projectId={projectId}
                  zoomLevel={zoomLevel}
                  visible={showHotspots}
                  isEmbedded={isEmbedded}
                  onTrigger={onHotspotTrigger}
                />
              ))}
            </div>
          )}

          {/* Image */}
          <img
            key={screen.id}
            src={`/api/static/${screen.imageUrl}`}
            style={{
              minWidth: screen.width * zoomLevel,
              minHeight: screen.height * zoomLevel,
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
  );
}
ScreenPreview.displayName = 'ScreenPreview';

export default ScreenPreview;
