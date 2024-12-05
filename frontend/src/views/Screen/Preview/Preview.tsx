import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Hotspot from '@/views/Screen/Preview/Hotspot';

import {
  ArchivedScreenDetails,
  HotspotWithMetadata,
  Conversation as ConversationType,
  Project,
  Screen,
  TargetType,
} from '@/types';
import { cn } from '@/lib/utils';
import Conversation from '../Conversation';
import { getStaticUrl } from '@/utils';

interface ScreenPreviewProps {
  isEmbedded?: boolean;
  closeParent?: () => void;
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
  allScreens?: Screen[];
  conversations?: ConversationType[];
  hotspots?: HotspotWithMetadata[];
  allHotspots?: HotspotWithMetadata[];
  showConversations: boolean | 'all';
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
    conversations,
    allScreens,
    allHotspots,
    showConversations,
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
          // If the current screen is the same as the target close the parent hotspot
          if (
            isEmbedded &&
            hotspot.targetScreenID.toString() === params.screenId
          ) {
            closeParent();

            return;
          }

          navigate(`/projects/${projectId}/${hotspot.targetScreenID}/preview`, {
            state: {
              previousScreenId: screenId?.toString(),
            },
          });
        } else if (targetType === 'lastScreenVisited') {
          // Navigates back to the last visited screen
          if (location?.state?.previousScreenId) {
            if (location.state.previousScreenId !== params.screenId) {
              navigate(
                `/projects/${projectId}/${location.state.previousScreenId}/preview`,
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

                navigate(`/projects/${projectId}/${adjacentScreenID}/preview`, {
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
              top:
                metaData.scrollOffset -
                ('fixedHeaderHeight' in screen ? screen.fixedHeaderHeight : 0),
              behavior: metaData.isSmoothScroll ? 'smooth' : 'instant',
            });
          }
        } else {
          alert('Unhandled target type');
        }
      }
    },
    [
      hotspots,
      navigate,
      projectId,
      screenId,
      location,
      params.screenId,
      isEmbedded,
      closeParent,
      screen,
      allScreens,
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

  // Organize the hotspots depending on their y value if the are located in the header/footer or the screen
  const [inHeaderHotpots, inFooterHotspots, restHotspots] = useMemo(() => {
    if (hotspots) {
      if ('fixedHeaderHeight' in screen) {
        return hotspots.reduce(
          (acc, hotspot) => {
            const hotspotY = hotspot.isBottomAligned
              ? (screen.height - hotspot.y - hotspot.height) * zoomLevel
              : hotspot.y * zoomLevel;

            const hotspotHeight = hotspot.height * zoomLevel;

            const fixedHeaderHeight = screen.fixedHeaderHeight * zoomLevel;

            const fixedFooterHeight = screen.fixedFooterHeight * zoomLevel;

            const fixedFooterY =
              (screen.height - screen.fixedFooterHeight) * zoomLevel;

            let isInHeader = false;

            // If there is a fixed header
            if (fixedHeaderHeight > 0) {
              isInHeader = hotspotY < fixedHeaderHeight;

              if (isInHeader) {
                acc[0].push(hotspot);
              }
            }

            let isInFooter = false;

            // If there is a fixed footer
            if (fixedFooterHeight > 0) {
              isInFooter =
                fixedFooterY > 0 &&
                (hotspotY >= fixedFooterY ||
                  hotspotY + hotspotHeight > fixedFooterY);

              if (isInFooter) {
                // Patch the hotspot y to be relative to the to of the fixedFooter
                if (!hotspot.isBottomAligned) {
                  hotspot = {
                    ...hotspot,
                    y: hotspot.y - fixedFooterY / zoomLevel,
                  };
                }

                acc[1].push(hotspot);
              }
            }

            const isInScreen =
              (!isInHeader && !isInFooter) ||
              (isInHeader && hotspotY + hotspotHeight > fixedHeaderHeight) ||
              (isInFooter && hotspotY < fixedFooterY);
            if (isInScreen) {
              acc[2].push(hotspot);
            }

            return acc;
          },
          [[], [], []] as [
            HotspotWithMetadata[],
            HotspotWithMetadata[],
            HotspotWithMetadata[],
          ],
        );
      }

      return [undefined, undefined, hotspots];
    }

    return [undefined, undefined, undefined];
  }, [hotspots, screen, zoomLevel]);

  useEffect(() => {
    return () => {
      // Clear any previous timeout if present
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Keep sync of the scroll on the fixed footer / header
  const handlePreviewScroll = useCallback(() => {
    const scrollLeft = ref.current?.scrollLeft;

    const fixedHeader =
      'fixedHeaderHeight' in screen &&
      screen.fixedHeaderHeight > 0 &&
      document.getElementById('screen-preview-fixed-header');

    const fixedFooter =
      'fixedFooterHeight' in screen &&
      screen.fixedFooterHeight > 0 &&
      document.getElementById('screen-preview-fixed-footer');

    if (fixedHeader) {
      fixedHeader.style.transform = `translate(-${scrollLeft}px)`;
    }

    if (fixedFooter) {
      fixedFooter.style.transform = `translate(-${scrollLeft}px)`;
    }
  }, [screen]);

  useEffect(() => {
    // Sync the scroll when the screen changed
    handlePreviewScroll();
  }, [handlePreviewScroll]);

  return (
    <div
      ref={ref}
      id="screen-preview"
      data-screen-id={screen.id.toString()}
      onScroll={handlePreviewScroll}
      className="flex flex-col relative mx-auto overflow-auto"
    >
      {/* Screen with hotspots */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: screen.width * zoomLevel,
          height:
            'fixedHeaderHeight' in screen
              ? `${(screen.height - screen.fixedHeaderHeight - screen.fixedFooterHeight) * zoomLevel}px`
              : 'auto',
          marginTop:
            'fixedHeaderHeight' in screen
              ? `${screen.fixedHeaderHeight * zoomLevel}px`
              : 0,
          marginBottom:
            'fixedFooterHeight' in screen
              ? `${screen.fixedFooterHeight * zoomLevel}px`
              : 0,
        }}
      >
        {/* Image */}
        <img
          // key={screen.id}
          decoding="sync"
          alt={screen.name}
          src={getStaticUrl(screen.imageUrl)}
          className={cn('object-contain', {
            'bg-[rgb(var(--screen-background-color))]': !isEmbedded,
          })}
          style={{
            marginTop:
              'fixedHeaderHeight' in screen
                ? -(screen.fixedHeaderHeight * zoomLevel)
                : 0,
            width: screen.width * zoomLevel,
            height: screen.height * zoomLevel,
            minWidth: screen.width * zoomLevel,
            minHeight: screen.height * zoomLevel,
            maxWidth: screen.width * zoomLevel,
            maxHeight: screen.height * zoomLevel,
            aspectRatio: `${screen.width} / ${screen.height}`,
          }}
        />

        {/* Conversations */}
        {conversations && !isEmbedded && (
          <div className="absolute left-0 inset-0 bg-transparent overflow-hidden">
            {conversations.map(conversation => (
              <Conversation
                key={`${projectId}/${screenId}/${conversation.id}`}
                screen={screen}
                conversation={conversation}
                zoomLevel={zoomLevel}
                visible={showConversations}
              />
            ))}
          </div>
        )}

        {/* Hotspots */}
        {restHotspots && (
          <div
            className="absolute left-0 inset-0 bg-transparent overflow-hidden"
            onClick={onHotspotGroupClick}
            style={{
              top:
                'fixedHeaderHeight' in screen
                  ? -(screen.fixedHeaderHeight * zoomLevel)
                  : 0,
            }}
          >
            {restHotspots.map(hotspot => (
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
                closeParent={closeParent}
              />
            ))}
          </div>
        )}

        {/* Fixed header */}
        {'fixedHeaderHeight' in screen && screen.fixedHeaderHeight > 0 && (
          <div
            id="screen-preview-fixed-header"
            className="fixed header top-0 overflow-hidden bg-no-repeat bg-top bg-cover"
            style={{
              height: `${screen.fixedHeaderHeight * zoomLevel}px`,
              width: screen.width * zoomLevel,
              backgroundImage: `url("${getStaticUrl(screen.imageUrl)}")`,
            }}
            onClick={onHotspotGroupClick}
          >
            {inHeaderHotpots &&
              inHeaderHotpots.map(hotspot => (
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
                  closeParent={closeParent}
                />
              ))}
          </div>
        )}

        {/* Fixed footer */}
        {'fixedFooterHeight' in screen && screen.fixedFooterHeight > 0 && (
          <div
            id="screen-preview-fixed-footer"
            className="fixed footer bottom-16 overflow-hidden bg-bottom bg-cover bg-no-repeat"
            style={{
              height: `${screen.fixedFooterHeight * zoomLevel}px`,
              width: screen.width * zoomLevel,
              backgroundImage: `url("${getStaticUrl(screen.imageUrl)}")`,
            }}
            onClick={onHotspotGroupClick}
          >
            {inFooterHotspots &&
              inFooterHotspots.map(hotspot => (
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
                  closeParent={closeParent}
                />
              ))}
          </div>
        )}
      </div>

      {/* Overlay (this contains the modals or any hovering screen) */}
      <div
        id={`overlay-${screen.id}`}
        className="overlay inset-0 absolute flex-shrink-0 empty:hidden"
        style={{
          width: screen.width * zoomLevel,
          height: screen.height * zoomLevel,
        }}
      />
    </div>
  );
}

ScreenPreview.displayName = 'ScreenPreview';

export default ScreenPreview;
