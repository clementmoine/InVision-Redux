import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import Hotspot from '@/views/Screen/Hotspot';

import {
  ArchivedScreenDetails,
  HotspotWithMetadata,
  Project,
  Screen,
  TargetType,
} from '@/types';

import { targetTypes } from '@/constants/hotspots';

interface ScreenPreviewProps {
  isEmbedded?: boolean;
  closeParent?: () => void;
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
  allScreens?: Screen[];
  hotspots?: HotspotWithMetadata[];
  allHotspots?: HotspotWithMetadata[];
}

function ScreenPreview(props: ScreenPreviewProps) {
  const {
    isEmbedded = false,
    closeParent = () => null,
    screenId,
    projectId,
    zoomLevel,
    screen,
    hotspots,
    allScreens,
    allHotspots,
  } = props;

  const ref = useRef<HTMLDivElement>(null);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const timeoutRef = useRef<number>();
  const [showHotspots, setShowHotspots] = useState(false);

  const onHotspotTrigger = useCallback(
    (id: HotspotWithMetadata['id'], targetType: TargetType) => {
      const hotspot = hotspots?.find(hotspot => hotspot.id === id);

      if (hotspot) {
        if (targetType === 'screen') {
          navigate(`/projects/${projectId}/${hotspot.targetScreenID}`, {
            state: {
              previousScreenId: screenId?.toString(),
            },
          });
        } else if (targetType === 'lastScreenVisited') {
          // Navigates back to the last visited screen
          // TODO: Check if a go back then a click on another go back on the previousScreen gets back to this screen
          if (location?.state?.previousScreenId) {
            if (location.state.previousScreenId !== params.screenId) {
              navigate(
                `/projects/${projectId}/${location.state.previousScreenId}`,
                {
                  state: {
                    previousScreenId: params.screenId?.toString(),
                  },
                },
              );
            } else {
              isEmbedded && closeParent();
            }
          } else {
            console.log('No visited screens');
          }
        } else if (
          targetType === 'previousScreenInSort' ||
          targetType === 'nextScreenInSort'
        ) {
          if (screen && allScreens) {
            const currentIndex = allScreens.findIndex(s => s.id === screen.id);

            if (currentIndex !== -1) {
              let adjacentIndex: number;

              if (targetType === 'previousScreenInSort') {
                adjacentIndex = currentIndex - 1;
              } else {
                adjacentIndex = currentIndex + 1;
              }

              if (adjacentIndex >= 0 && adjacentIndex < allScreens.length) {
                const adjacentScreenID = allScreens[adjacentIndex].id;
                navigate(`/projects/${projectId}/${adjacentScreenID}`, {
                  state: {
                    previousScreenId: hotspot.screenID.toString(),
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
      allScreens,
      closeParent,
      hotspots,
      isEmbedded,
      params,
      location,
      navigate,
      projectId,
      screen,
      screenId,
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

  useEffect(() => {
    return () => {
      // Clear any previous timeout if present
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      id="screen-preview"
      className="flex w-full h-full overflow-auto"
    >
      <div
        className={`flex relative mx-auto`}
        style={{
          height: screen.height * zoomLevel,
          width: screen.width * zoomLevel,
        }}
      >
        {/* Image */}
        <img
          decoding="sync"
          src={`/api/static/${screen.imageUrl}`}
          style={{
            minWidth: screen.width * zoomLevel,
            minHeight: screen.height * zoomLevel,
            aspectRatio: `${screen.width} / ${screen.height}`,
          }}
        />

        {/* Hotspots */}
        {hotspots && (
          <div
            className="absolute inset-0 bg-transparent overflow-hidden"
            onClick={onHotspotGroupClick}
          >
            {hotspots.map(hotspot => (
              <Hotspot
                key={`${projectId}/${screenId}/${hotspot.id}`}
                screen={screen}
                hotspot={hotspot}
                projectId={projectId}
                zoomLevel={zoomLevel}
                visible={showHotspots}
                isEmbedded={isEmbedded}
                allScreens={allScreens}
                allHotspots={allHotspots}
                onTrigger={onHotspotTrigger}
                screenID={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
ScreenPreview.displayName = 'ScreenPreview';

export default ScreenPreview;
