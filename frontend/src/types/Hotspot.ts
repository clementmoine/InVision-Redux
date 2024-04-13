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

export type EventTypes = keyof typeof eventTypes;
export type EventTypeId = (typeof eventTypes)[EventTypes];

export type TransitionTypes = keyof typeof transitionTypes;
export type TransitionTypeId = (typeof transitionTypes)[TransitionTypes];

export type TargetTypes = keyof typeof targetTypes;
export type TargetTypeId = (typeof targetTypes)[TargetTypes];

export interface HotspotLinkToScreen {
  metaData: Record<never, never>;
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
  metaData: Record<never, never>;
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

export interface UnknownMetadata {
  metaData: Record<string, unknown>;
}

export interface Hotspot<TargetType extends TargetTypes = TargetTypes> {
  isBottomAligned: boolean;
  height: number;
  templateID: Template['id'] | '';
  eventTypeID: EventTypeId;
  createdAt: number; // Timestamp (ms)
  targetScreenID: Screen['id'];
  y: number;
  transitionTypeID: TransitionTypeId;
  screenID: Screen['id'];
  targetTypeID: (typeof targetTypes)[TargetType];
  width: number;
  x: number;
  updatedAt: number; // Timestamp (ms)
  sourceID: number;
  id: number;
  isScrollTo: boolean;
}
export type HotspotTypeMap = {
  [targetType in TargetTypes]: targetType extends 'screen'
    ? HotspotLinkToScreen
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

export type HotspotWithMetadata<TargetType extends TargetTypes = TargetTypes> =
  Hotspot<TargetType> & { metaData: HotspotTypeMap[TargetType] };

const hotspot = {} as HotspotWithMetadata;

if (hotspot.targetTypeID === 5) {
  hotspot.metaData;
}
