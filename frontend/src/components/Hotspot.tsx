import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useMemo, AnchorHTMLAttributes } from 'react';

import { eventTypes, targetTypes } from '@/constants/hotspots';

import { HotspotWithMetadata, EventTypes, Screen } from '@/types';

interface HotspotProps {
  hotspot: HotspotWithMetadata;
  visible: boolean;
  zoomLevel: number;
  screens: Screen[];
  onTrigger?: (id: HotspotWithMetadata['id']) => void;
}

const Hotspot: React.FC<HotspotProps> = props => {
  const { hotspot, visible, onTrigger, screens, zoomLevel } = props;

  const params = useParams();
  const navigate = useNavigate();

  const onHotspotEvent = useCallback(() => {
    if (hotspot.targetTypeID === targetTypes.screen) {
      navigate(`/projects/${params.projectId}/${hotspot.targetScreenID}`);
    } else if (hotspot.targetTypeID === targetTypes.lastScreenVisited) {
      navigate(-1); // Navigates back to the previous screen
    } else if (hotspot.targetTypeID === targetTypes.previousScreenInSort) {
      const currentIndex = screens.findIndex(
        screen => screen.id === hotspot.targetScreenID,
      );
      if (currentIndex !== -1 && currentIndex > 0) {
        const previousScreenID = screens[currentIndex - 1].id;
        navigate(`/projects/${params.projectId}/${previousScreenID}`);
      }
    } else if (hotspot.targetTypeID === targetTypes.nextScreenInSort) {
      const currentIndex = screens.findIndex(
        screen => screen.id === hotspot.targetScreenID,
      );
      if (currentIndex !== -1 && currentIndex < screens.length - 1) {
        const nextScreenID = screens[currentIndex + 1].id;
        navigate(`/projects/${params.projectId}/${nextScreenID}`);
      }
    } else if (hotspot.targetTypeID === targetTypes.externalUrl) {
      window.open(hotspot.metaData.url, '_blank');
    } else if (hotspot.targetTypeID === targetTypes.positionOnScreen) {
      // Handle positioning on the screen
      // Example: Scroll to a specific position on the screen
    } else if (hotspot.targetTypeID === targetTypes.screenOverlay) {
      // Handle screen overlay
      // Example: Show a modal or overlay on the screen
    } else {
      alert('Unhandled target type');
    }
  }, [params, navigate, hotspot, screens]);

  const handleHotspotEvent = useCallback(() => {
    onTrigger?.(hotspot.id);
    onHotspotEvent();
  }, [hotspot, onHotspotEvent, onTrigger]);

  const eventProps = useMemo(() => {
    const eventPerType: Record<
      EventTypes,
      keyof AnchorHTMLAttributes<HTMLAnchorElement> | null
    > = {
      click: 'onClick',
      doubleTap: 'onDoubleClick',
      pressHold: null,
      swipeRight: null,
      swipeLeft: null,
      swipeUp: null,
      swipeDown: null,
      hover: null,
      timer: null,
    };

    const eventType = (
      Object.keys(eventTypes) as (keyof typeof eventTypes)[]
    ).find(key => eventTypes[key] === hotspot.eventTypeID);

    if (eventType) {
      const eventName = eventPerType[eventType];
      if (eventName) {
        return {
          [eventName]: handleHotspotEvent,
        };
      }
    }
    return {};
  }, [hotspot.eventTypeID, handleHotspotEvent]);

  return (
    <a
      data-hotspot-id={hotspot.id}
      role="button"
      {...eventProps}
      className="absolute border-blue-400 bg-blue-400/50 border-2 z-20 transition-opacity duration-500"
      style={{
        height: hotspot.height / zoomLevel,
        width: hotspot.width / zoomLevel,
        top: hotspot.y / zoomLevel,
        left: hotspot.x / zoomLevel,
        opacity: visible ? 1 : 0,
      }}
    ></a>
  );
};

export default Hotspot;
