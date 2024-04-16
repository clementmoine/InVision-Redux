import {
  inline,
  useClick,
  useFloating,
  useHover,
  offset,
  useInteractions,
  useDismiss,
  safePolygon,
  FloatingOverlay,
} from '@floating-ui/react';

import { MouseEvent, useMemo, useState } from 'react';

import ScreenPreview from '@/components/ScreenPreview';

import { eventTypes, targetTypes } from '@/constants/hotspots';

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

  // if (hotspot.id === 1332474403) {
  //   console.log(hotspot.id, positionOffset);
  // }

  const { refs, floatingStyles, context } = useFloating({
    open: isOverlayOpen,
    onOpenChange: setIsOverlayOpen,
    transform: false,
    middleware: [
      inline({
        x: 0,
        y: 0,
      }),
      offset({
        crossAxis: positionOffset?.x || 0,
        mainAxis: positionOffset?.y || 0,
      }),
    ],
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

  const style = useMemo(() => {
    return {
      height: hotspot.height * zoomLevel,
      width: hotspot.width * zoomLevel,
      top: hotspot.y * zoomLevel,
      left: hotspot.x * zoomLevel,
      opacity: visible ? 1 : 0,
    };
  }, [hotspot, visible, zoomLevel]);

  return (
    <>
      <button
        data-hotspotid={hotspot.id.toString()}
        data-screenid={hotspot.screenID.toString()}
        ref={refs.setReference}
        style={style}
        className={
          'absolute border-blue-400 bg-blue-400/50 border-2 z-20 transition-opacity duration-500'
        }
        {...getReferenceProps({
          onClick: event => {
            event.stopPropagation();

            if (targetType === 'screenOverlay') {
              location.state = {
                previousScreenId: hotspot.screenID,
              };
            }

            onTrigger(hotspot.id, targetType!, event);
          },
        })}
      />

      {isOverlayOpen && !isEmbedded && (
        <>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              top: `${positionOffset?.y}px`,
              left: `${positionOffset?.x}px`,
            }}
            className="z-100"
            {...getFloatingProps()}
          >
            <ScreenPreview
              isEmbedded
              screenId={hotspot.targetScreenID}
              projectId={projectId}
              zoomLevel={zoomLevel}
            />
          </div>

          <FloatingOverlay />
        </>
      )}
    </>
  );
};

export default Hotspot;
