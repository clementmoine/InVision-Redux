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
  useMemo,
  useState,
} from 'react';

import ScreenPreview from '@/components/ScreenPreview';

import {
  eventTypes,
  overlayPositionOptions,
  targetTypes,
} from '@/constants/hotspots';

import {
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
  isEmbedded?: boolean;
  screenID: Screen['id'];
  projectId: Project['id'];
  onTrigger: (
    id: HotspotWithMetadata['id'],
    target: TargetType,
    event: MouseEvent<Element, globalThis.MouseEvent>,
  ) => void;
}

const Hotspot: React.FC<HotspotProps> = props => {
  const {
    isEmbedded = false,
    hotspot,
    visible,
    onTrigger,
    projectId,
    zoomLevel,
  } = props;

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

      return {
        x: positionOffset.x,
        y: positionOffset.y,
      };
    }
  }, [hotspot, targetType]);

  const position = useMemo(() => {
    const { metaData } = hotspot as HotspotWithMetadata<'screenOverlay'>;

    if (targetType === 'screenOverlay') {
      const position = overlayPositionOptions.find(
        overlayPosition => overlayPosition.id === metaData.overlay.positionID,
      )?.title;

      return position;
    }
  }, [targetType, hotspot]);

  const { refs, context } = useFloating({
    open: isOverlayOpen,
    onOpenChange: setIsOverlayOpen,
  });

  const hover = useHover(context, {
    enabled: eventType === 'hover' && targetType === 'screenOverlay',
    handleClose: safePolygon({
      requireIntent: false,
    }),
  });

  const click = useClick(context, {
    enabled: eventType === 'click' && targetType === 'screenOverlay',
    event: eventType === 'pressHold' ? 'mousedown' : 'click',
  });

  const dismiss = useDismiss(context, {
    enabled:
      targetType === 'screenOverlay' &&
      (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData.overlay
        .closeOnOutsideClick,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    dismiss,
  ]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, [setIsOverlayOpen]);

  const style = useMemo(() => {
    return {
      height: hotspot.height * zoomLevel,
      width: hotspot.width * zoomLevel,
      top: hotspot.y * zoomLevel,
      left: hotspot.x * zoomLevel,
      opacity: visible ? 1 : 0,
    };
  }, [hotspot, visible, zoomLevel]);

  const overlayContainerStyle = useMemo(() => {
    const style: CSSProperties = {};

    if (targetType === 'screenOverlay') {
      style.position =
        targetType === 'screenOverlay' &&
        position !== 'Custom' &&
        (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData.overlay
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
          onClick: event => {
            event.stopPropagation();

            if (targetType === 'screenOverlay') {
              location.state = {
                previousScreenId: hotspot.screenID.toString(),
              };
            }

            onTrigger(hotspot.id, targetType!, event);
          },
        })}
        style={style}
        data-hotspotid={hotspot.id.toString()}
        data-screenid={hotspot.screenID.toString()}
        className={`absolute border-blue-400 bg-blue-400/50 border-2 transition-opacity duration-500 cursor-pointer`}
      />

      {isOverlayOpen && !isEmbedded && (
        <>
          <div
            className={`inset-0 z-20 flex items-center justify-center`}
            style={{
              ...overlayContainerStyle,
              ['--tw-bg-opacity']:
                (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData
                  .overlay.bgOpacity / 100 || 0,
              backgroundColor: `rgb(var(--screen-background-color) / ${
                (hotspot as HotspotWithMetadata<'screenOverlay'>).metaData
                  .overlay.bgOpacity / 100 || 0
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
                closeParent={closeOverlay}
                screenId={hotspot.targetScreenID}
                projectId={projectId}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Hotspot;
