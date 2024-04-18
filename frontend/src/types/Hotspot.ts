import {
  eventTypes,
  overlayPositionOptions,
  overlayTransitionOptions,
  targetTypes,
  transitionTypes,
} from '@/constants/hotspots';

import { Screen, Template } from '@/types';

export type OverlayPosition = (typeof overlayPositionOptions)[number]['title'];
export type OverlayPositionID = (typeof overlayPositionOptions)[number]['id'];

export type OverlayTransition =
  (typeof overlayTransitionOptions)[number]['title'];
export type OverlayTransitionID =
  (typeof overlayTransitionOptions)[number]['id'];

export type EventType = keyof typeof eventTypes;
export type EventTypeId = (typeof eventTypes)[EventType];

export type TransitionType = keyof typeof transitionTypes;
export type TransitionTypeId = (typeof transitionTypes)[TransitionType];

export type TargetType = keyof typeof targetTypes;
export type TargetTypeId = (typeof targetTypes)[TargetType];

export interface HotspotLinkToScreen<E extends EventType = EventType> {
  metaData: {
    redirectAfter: E extends 'timer' ? number : undefined;
    stayOnScreen: E extends 'timer' ? undefined : boolean;
  };
}

export interface HotspotLastScreenVisited {
  metaData: Record<never, never>;
  targetScreenID: 0;
}

export interface HotspotPreviousNextScreenVisited {
  metaData: Record<never, never>;
  targetScreenID: 0;
}

export interface HotspotExternalURL {
  metaData: {
    isOpenInNewWindow: boolean;
    url: string;
  };
}
export interface HotspotPositionOnScreen {
  metaData: {
    isSmoothScroll: boolean; // Duration (450 ms)
    scrollOffset: number;
  };
}

export interface HotspotLinkToAnotherPointOnThisScreen {
  metaData: {
    isSmoothScroll: boolean;
    scrollOffset: number;
  };
}

export interface HotspotLinkToScreenAsOverlay {
  metaData: {
    overlay: {
      positionOffset: {
        y: number;
        x: number;
      };
      positionID: OverlayPositionID;
      closeOnOutsideClick: boolean;
      isFixedPosition: boolean;
      transitionID: OverlayTransitionID;
      reverseTransitionOnClose: boolean;
      bgOpacity: number;
    };
    stayOnScreen: boolean;
  };
}

export interface Hotspot<T extends TargetType = TargetType> {
  isBottomAligned: boolean;
  height: number;
  templateID: Template['id'] | '';
  eventTypeID: EventTypeId;
  createdAt: number; // Timestamp (ms)
  targetScreenID: Screen['id'];
  y: number;
  transitionTypeID: TransitionTypeId;
  screenID: Screen['id'];
  targetTypeID: (typeof targetTypes)[T];
  width: number;
  x: number;
  updatedAt: number; // Timestamp (ms)
  sourceID: number;
  id: number;
  isScrollTo: boolean;
}

export type HotspotTypeMap<E extends EventType = EventType> = {
  [targetType in TargetType]: targetType extends 'screen'
    ? HotspotLinkToScreen<E>
    : targetType extends 'lastScreenVisited'
      ? HotspotLastScreenVisited
      : targetType extends 'previousScreenInSort' | 'nextScreenInSort'
        ? HotspotPreviousNextScreenVisited
        : targetType extends 'externalUrl'
          ? HotspotExternalURL
          : targetType extends 'positionOnScreen'
            ? HotspotPositionOnScreen
            : targetType extends 'screenOverlay'
              ? HotspotLinkToScreenAsOverlay
              : unknown;
};

export type HotspotWithMetadata<
  T extends TargetType = TargetType,
  E extends EventType = EventType,
> = Hotspot<T> & HotspotTypeMap<E>[T];
