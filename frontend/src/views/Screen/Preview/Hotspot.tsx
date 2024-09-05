import {
  useClick,
  useFloating,
  useHover,
  useInteractions,
  useDismiss,
  safePolygon,
  OpenChangeReason,
  FloatingPortal,
} from '@floating-ui/react';
import { useLocation } from 'react-router-dom';
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  eventTypes,
  overlayPositionOptions,
  targetTypes,
  zoomScrollBehaviors,
} from '@/constants/hotspots';

import {
  ArchivedScreenDetails,
  EventType,
  HotspotWithMetadata,
  Project,
  Screen,
  TargetType,
} from '@/types';

import { useDoubleClick } from '@/hooks/useDoubleClick';
import { useLongPress } from '@/hooks/useLongPress';
import { useSwipe } from '@/hooks/useSwipe';

import Preview from '@/views/Screen/Preview/Preview';

interface HotspotProps {
  hotspot: HotspotWithMetadata;
  visible: boolean;
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
  isEmbedded?: boolean;
  screenID: Screen['id'];
  projectId: Project['id'];
  allScreens?: Screen[];
  allHotspots?: HotspotWithMetadata[];
  onTrigger: (
    id: HotspotWithMetadata['id'],
    target: TargetType,
    event?: Event,
  ) => void;
  closeParent?: () => void;
}

const Hotspot: React.FC<HotspotProps> = props => {
  const {
    isEmbedded = false,
    hotspot,
    visible,
    screen: currentScreen,
    allHotspots,
    onTrigger,
    projectId,
    zoomLevel,
    allScreens,
    closeParent,
  } = props;

  const timeoutRef = useRef<number>();

  const location = useLocation();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const targetType = useMemo(() => {
    return (Object.keys(targetTypes) as TargetType[]).find(
      key => targetTypes[key] === hotspot.targetTypeID,
    );
  }, [hotspot]);

  const eventType = useMemo(() => {
    return (Object.keys(eventTypes) as EventType[]).find(
      key => eventTypes[key] === hotspot.eventTypeID,
    );
  }, [hotspot]);

  const positionOffset = useMemo(() => {
    if (targetType === 'screenOverlay') {
      const { positionOffset } = (
        hotspot as HotspotWithMetadata<'screenOverlay'>
      ).metaData.overlay;

      if (
        'zoomScrollBehavior' in currentScreen &&
        currentScreen.zoomScrollBehavior ===
          zoomScrollBehaviors.ZOOM_OUT_TO_BROWSER_WIDTH
      ) {
        return {
          x: positionOffset.x * zoomLevel,
          y: positionOffset.y * zoomLevel,
        };
      }

      return {
        x: positionOffset.x * 2 * zoomLevel,
        y: positionOffset.y * 2 * zoomLevel,
      };
    }
  }, [hotspot, currentScreen, targetType, zoomLevel]);

  const position = useMemo(() => {
    if (targetType === 'screenOverlay') {
      const { metaData } = hotspot as HotspotWithMetadata<'screenOverlay'>;

      const position = overlayPositionOptions.find(
        overlayPosition => overlayPosition.id === metaData.overlay.positionID,
      )?.title;

      return position || 'Top Left';
    } else if (
      targetType === 'screen' &&
      !(hotspot as HotspotWithMetadata<typeof targetType>).metaData.stayOnScreen
    ) {
      return 'Top Left';
    }
  }, [targetType, hotspot]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, [setIsOverlayOpen]);

  const [previousScreen, nextScreen] = useMemo(() => {
    if (allScreens) {
      const currentScreenIndex = allScreens.findIndex(
        s => s.id === currentScreen.id,
      );

      if (currentScreenIndex != -1 && currentScreenIndex != null) {
        let prevIndex = currentScreenIndex - 1;
        let nextIndex = currentScreenIndex + 1;

        if (prevIndex < 0) {
          prevIndex = allScreens?.length;
        }

        if (nextIndex >= allScreens?.length) {
          nextIndex = 0;
        }

        return [allScreens[prevIndex], allScreens[nextIndex]];
      }
    }

    return [undefined, undefined];
  }, [allScreens, currentScreen.id]);

  const targetScreen = useMemo(() => {
    return allScreens?.find(screen => {
      const targetScreenID =
        hotspot.targetTypeID === targetTypes.lastScreenVisited
          ? location?.state?.previousScreenId
          : hotspot.targetTypeID === targetTypes.nextScreenInSort
            ? nextScreen?.id
            : hotspot.targetTypeID === targetTypes.previousScreenInSort
              ? previousScreen?.id
              : hotspot.targetScreenID;

      return targetScreenID === screen.id;
    });
  }, [allScreens, hotspot, location, nextScreen, previousScreen]);

  const targetScreenHotspots = useMemo(() => {
    if (targetScreen) {
      const targetHotspots = allHotspots?.filter(
        h => h.screenID === targetScreen.id,
      );

      if (
        targetType &&
        eventType === 'hover' &&
        // Pure Typescript condition for the targetType to exclude those types (No stay on screen on these)
        targetType !== 'externalUrl' &&
        targetType !== 'positionOnScreen' &&
        !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
          .stayOnScreen
      ) {
        targetHotspots?.unshift(hotspot);
      }

      return targetHotspots;
    }
  }, [allHotspots, eventType, hotspot, targetScreen, targetType]);

  // Handle open (for floating and trigger hotspot actions)
  const handleOpen = useCallback(
    (
      open: boolean,
      event?: Event | undefined,
      _reason?: OpenChangeReason | undefined,
    ) => {
      // Open the screen in overlay (floating ui)
      if (
        targetType &&
        (targetType === 'screenOverlay' ||
          (eventType === 'hover' &&
            // Pure Typescript condition for the targetType to exclude those types (No stay on screen on these)
            targetType !== 'externalUrl' &&
            targetType !== 'positionOnScreen' &&
            !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
              .stayOnScreen))
      ) {
        location.state = {
          previousScreenId: currentScreen.id.toString(),
        };

        setIsOverlayOpen(open);

        if (targetScreen) {
          // Set the overlay width
          const overlay = document.getElementById(
            `overlay-${currentScreen.id}`,
          );

          if (overlay) {
            overlay.style.width = `${targetScreen.width * zoomLevel}px`;
            overlay.style.height = `${targetScreen.height * zoomLevel}px`;
          }
        }

        return;
      }

      // Navigate to the screen
      if (open) {
        event?.stopPropagation();

        onTrigger(hotspot.id, targetType!, event);
      }
    },
    [
      currentScreen.id,
      eventType,
      hotspot,
      location,
      onTrigger,
      targetScreen,
      targetType,
      zoomLevel,
    ],
  );

  const { refs, context } = useFloating({
    open: isOverlayOpen,
    onOpenChange: handleOpen,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    // Hover
    useHover(context, {
      enabled: eventType === 'hover',
      handleClose: safePolygon({
        requireIntent: false,
      }),
    }),
    // Click
    useClick(context, {
      enabled: eventType === 'click',
      event: eventType === 'pressHold' ? 'mousedown' : 'click',
    }),
    // Double tap
    useDoubleClick(context, {
      enabled: eventType === 'doubleTap',
    }),
    // Long press
    useLongPress(context, {
      enabled: eventType === 'pressHold',
    }),
    // Swipe
    useSwipe(context, {
      enabled:
        eventType === 'swipeLeft' ||
        eventType === 'swipeRight' ||
        eventType === 'swipeDown' ||
        eventType === 'swipeUp',
      direction:
        eventType === 'swipeLeft'
          ? 'left'
          : eventType === 'swipeRight'
            ? 'right'
            : eventType === 'swipeDown'
              ? 'down'
              : eventType === 'swipeUp'
                ? 'up'
                : undefined,
    }),

    // Dismiss for click to close when clicking outside
    useDismiss(context, {
      enabled:
        targetType &&
        (targetType === 'screenOverlay' ||
          (eventType === 'hover' &&
            // Pure Typescript condition for the targetType to exclude those types (No stay on screen on these)
            targetType !== 'externalUrl' &&
            targetType !== 'positionOnScreen' &&
            !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
              .stayOnScreen)),
    }),
  ]);

  const style = useMemo(() => {
    return {
      height: hotspot.height * zoomLevel,
      width: hotspot.width * zoomLevel,
      top: hotspot.isBottomAligned
        ? (currentScreen.height - hotspot.y - hotspot.height) * zoomLevel
        : hotspot.y * zoomLevel,
      left: hotspot.x * zoomLevel,
      opacity: visible ? 1 : 0,
    };
  }, [currentScreen, hotspot, visible, zoomLevel]);

  const overlayContainerStyle = useMemo(() => {
    const style: CSSProperties = {};

    if (targetType) {
      style.position =
        targetType === 'screenOverlay' &&
        position !== 'Custom' &&
        (hotspot as HotspotWithMetadata<typeof targetType>).metaData.overlay
          .isFixedPosition
          ? 'fixed'
          : 'absolute';

      if (position === 'Centered') {
        style.alignItems = 'center';
        style.justifyContent = 'center';
      } else if (position === 'Bottom Center') {
        style.alignItems = 'end';
        style.justifyContent = 'center';
      } else if (position === 'Bottom Left') {
        style.alignItems = 'end';
        style.justifyContent = 'start';
      } else if (position === 'Bottom Right') {
        style.alignItems = 'end';
        style.justifyContent = 'end';
      } else if (position === 'Top Center') {
        style.alignItems = 'start';
        style.justifyContent = 'center';
      } else if (position === 'Top Left') {
        style.alignItems = 'start';
        style.justifyContent = 'start';
      } else if (position === 'Top Right') {
        style.alignItems = 'start';
        style.justifyContent = 'end';
      } else if (position === 'Custom') {
        style.alignItems = 'start';
        style.justifyContent = 'start';
      }
    }

    return style;
  }, [hotspot, position, targetType]);

  // Timer hotspot
  useEffect(() => {
    if (
      targetType &&
      'redirectAfter' in hotspot.metaData &&
      eventType === 'timer'
    ) {
      const { redirectAfter } = hotspot.metaData; // ms

      // Clear any previous timeout if present
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        location.state = {
          previousScreenId: hotspot.screenID.toString(),
        };

        onTrigger(hotspot.id, targetType!);
      }, redirectAfter);
    }

    return () => {
      // Clear any previous timeout if present
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [eventType, hotspot, location, onTrigger, targetType]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onMouseLeave: () => {
            // Mouse leave on the hotspot when embedded
            if (
              isEmbedded &&
              targetType &&
              // Disabled that since we want to trigger the embedded hotspot
              // eventType === 'hover' &&

              // Pure Typescript condition for the targetType to exclude those types (No stay on screen on these)
              targetType !== 'externalUrl' &&
              targetType !== 'positionOnScreen' &&
              !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
                .stayOnScreen
            ) {
              closeParent?.();
            }
          },
        })}
        style={style}
        data-event={eventType}
        data-target={targetType}
        data-hotspotid={hotspot.id.toString()}
        data-screenid={hotspot.screenID.toString()}
        className="absolute border border-blue-400 bg-blue-400/50 transition-opacity duration-500"
      />

      {isOverlayOpen && !isEmbedded && targetScreen && (
        <FloatingPortal id={`overlay-${currentScreen.id}`}>
          <div
            className="inset-0 z-100 flex items-center justify-center"
            style={{
              ...overlayContainerStyle,
              backgroundColor: `rgb(var(--screen-background-color) / ${
                (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData
                  ?.overlay?.bgOpacity / 100 || 0
              })`,
            }}
          >
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              data-position={position}
              className="absolute z-50"
              style={{
                transform:
                  position === 'Custom'
                    ? `translate(${positionOffset?.x}px, ${positionOffset?.y}px)`
                    : undefined,
              }}
            >
              <Preview
                isEmbedded
                allScreens={allScreens}
                screen={targetScreen}
                projectId={projectId}
                zoomLevel={zoomLevel}
                hotspots={targetScreenHotspots}
                allHotspots={allHotspots}
                closeParent={closeOverlay}
                screenId={targetScreen.id}
              />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Hotspot;
