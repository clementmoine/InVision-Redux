import {
  useClick,
  useFloating,
  useHover,
  useInteractions,
  useDismiss,
  safePolygon,
} from '@floating-ui/react';

import {
  CSSProperties,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import ScreenPreview from '@/views/Screen/ScreenPreview';

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
import { useLocation } from 'react-router-dom';

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
    event?: MouseEvent<Element, globalThis.MouseEvent>,
  ) => void;
  closeParent?: () => void;
}

const Hotspot: React.FC<HotspotProps> = props => {
  const {
    isEmbedded = false,
    hotspot,
    visible,
    screen,
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
        'zoomScrollBehavior' in screen &&
        screen.zoomScrollBehavior ===
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
  }, [hotspot, screen, targetType, zoomLevel]);

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

  const targetScreen = useMemo(
    () => allScreens?.find(screen => hotspot.targetScreenID === screen.id),
    [allScreens, hotspot],
  );

  const targetScreenHotspots = useMemo(() => {
    const targetHotspots = allHotspots?.filter(
      h => h.screenID === hotspot.targetScreenID,
    );

    if (
      targetType === 'screen' &&
      !(hotspot as HotspotWithMetadata<typeof targetType>).metaData.stayOnScreen
    ) {
      targetHotspots?.unshift(hotspot);
    }

    return targetHotspots;
  }, [allHotspots, hotspot, targetType]);

  // Timer hotspot
  useEffect(() => {
    if (targetType === 'screen' && eventType === 'timer') {
      const { redirectAfter } = (
        hotspot as HotspotWithMetadata<typeof targetType, typeof eventType>
      ).metaData; // ms

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

  const { refs, context } = useFloating({
    open: isOverlayOpen,
    onOpenChange: setIsOverlayOpen,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    // Hover
    useHover(context, {
      enabled:
        eventType === 'hover' &&
        (targetType === 'screenOverlay' ||
          (targetType === 'screen' &&
            !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
              .stayOnScreen)),
      handleClose: safePolygon({
        requireIntent: false,
      }),
    }),
    // Click
    useClick(context, {
      enabled: eventType === 'click' && targetType === 'screenOverlay',
      event: eventType === 'pressHold' ? 'mousedown' : 'click',
    }),
    // Dismiss for click to close when clicking outside
    useDismiss(context, {
      enabled:
        eventType === 'click' &&
        ((targetType === 'screenOverlay' &&
          (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData.overlay
            .closeOnOutsideClick) ||
          (targetType === 'screen' &&
            !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
              .stayOnScreen)),
    }),
  ]);

  const style = useMemo(() => {
    return {
      height: hotspot.height * zoomLevel,
      width: hotspot.width * zoomLevel,
      top: hotspot.isBottomAligned
        ? (screen.height - hotspot.y - hotspot.height) * zoomLevel
        : hotspot.y * zoomLevel,
      left: hotspot.x * zoomLevel,
      opacity: visible ? 1 : 0,
    };
  }, [screen, hotspot, visible, zoomLevel]);

  const overlayContainerStyle = useMemo(() => {
    const style: CSSProperties = {};

    if (
      targetType === 'screenOverlay' ||
      (targetType === 'screen' &&
        !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
          .stayOnScreen)
    ) {
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

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onMouseLeave: () => {
            if (
              eventType === 'hover' &&
              isEmbedded &&
              targetType === 'screen' &&
              !(hotspot as HotspotWithMetadata<typeof targetType>).metaData
                .stayOnScreen
            ) {
              closeParent?.();
            }
          },
          onMouseEnter: event => {
            if (eventType === 'hover') {
              event.stopPropagation();

              if (
                targetType === 'screen' &&
                (hotspot as HotspotWithMetadata<typeof targetType>).metaData
                  .stayOnScreen
              ) {
                location.state = {
                  previousScreenId: hotspot.screenID.toString(),
                };
                onTrigger(hotspot.id, targetType!, event);
              }
            }
          },
          onClick: event => {
            if (eventType === 'click') {
              event.stopPropagation();

              if (targetType === 'screenOverlay') {
                location.state = {
                  previousScreenId: hotspot.screenID.toString(),
                };
              }

              onTrigger(hotspot.id, targetType!, event);
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
        <>
          <div
            className="inset-0 z-20 flex items-center justify-center"
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
              <ScreenPreview
                isEmbedded
                allScreens={allScreens}
                screen={targetScreen}
                projectId={projectId}
                zoomLevel={zoomLevel}
                hotspots={targetScreenHotspots}
                allHotspots={allHotspots}
                closeParent={closeOverlay}
                screenId={hotspot.targetScreenID}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Hotspot;
