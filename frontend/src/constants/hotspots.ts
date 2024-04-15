/**
 * Possible event types.
 * 1: Click
 * 2: Double Tap
 * 3: Press Hold
 * 4: Swipe Right
 * 5: Swipe Left
 * 6: Swipe Up
 * 7: Swipe Down
 * 8: Hover
 * 9: Timer
 */
export const eventTypes = {
  click: 1,
  doubleTap: 2,
  pressHold: 3,
  swipeRight: 4,
  swipeLeft: 5,
  swipeUp: 6,
  swipeDown: 7,
  hover: 8,
  timer: 9,
} as const;

/**
 * Possible target types.
 * 1: Screen
 * 2: Last Screen Visited
 * 3: Previous Screen In Sort
 * 4: Next Screen In Sort
 * 5: External URL
 * 6: Position On Screen
 * 7: Screen Overlay
 */
export const targetTypes = {
  screen: 1,
  lastScreenVisited: 2,
  previousScreenInSort: 3,
  nextScreenInSort: 4,
  externalUrl: 5,
  positionOnScreen: 6,
  screenOverlay: 7,
} as const;

/**
 * Possible transition types.
 * 1: None
 * 2: Push Right
 * 3: Push Left
 * 4: Slide Up
 * 5: Slide Down
 * 6: Flip Right
 * 7: Flip Left
 * 8: Dissolve
 */
export const transitionTypes = {
  none: 1,
  pushRight: 2,
  pushLeft: 3,
  slideUp: 4,
  slideDown: 5,
  flipRight: 6,
  flipLeft: 7,
  dissolve: 8,
} as const;

/**
 * Possible overlay position options.
 * - Custom
 * - Centered
 * - Top Left
 * - Top Center
 * - Top Right
 * - Bottom Left
 * - Bottom Center
 * - Bottom Right
 */
export const overlayPositionOptions = [
  {
    title: 'Custom',
    id: 1,
  },
  {
    title: 'Centered',
    id: 2,
    isDefault: !0,
  },
  {
    title: 'Top Left',
    id: 5,
  },
  {
    title: 'Top Center',
    id: 3,
  },
  {
    title: 'Top Right',
    id: 4,
  },
  {
    title: 'Bottom Left',
    id: 8,
  },
  {
    title: 'Bottom Center',
    id: 6,
  },
  {
    title: 'Bottom Right',
    id: 7,
  },
] as const;

export const overlayPositionOptionsByTitle = overlayPositionOptions.reduce(
  (acc, option) => {
    acc[option.title] = option.id;
    return acc;
  },
  {} as Record<
    (typeof overlayPositionOptions)[number]['title'],
    (typeof overlayPositionOptions)[number]['id']
  >,
);

/**
 * Possible overlay transition options.
 * - Fade in
 * - Instant
 * - Fade in & Scale
 * - Slide in Left
 * - Slide in Right
 * - Slide in Bottom
 * - Slide in Top
 * - Fall
 * - Side Fall
 * - Sticky Up
 * - 3D Flip (Horizontal)
 * - 3D Flip (Vertical)
 * - 3D Sign
 * - Super Scaled
 * - 3D Rotate in Left
 * - 3D Rotate in Right
 * - 3D Rotate in Top
 * - 3D Rotate in Bottom
 */
export const overlayTransitionOptions = [
  {
    title: 'Fade in',
    id: 4,
    isDefault: !0,
  },
  {
    title: 'Instant',
    id: 12,
  },
  {
    title: 'Fade in & Scale',
    id: 1,
  },
  {
    title: 'Slide in Left',
    id: 18,
  },
  {
    title: 'Slide in Right',
    id: 2,
  },
  {
    title: 'Slide in Bottom',
    id: 3,
  },
  {
    title: 'Slide in Top',
    id: 17,
  },
  {
    title: 'Fall ',
    id: 5,
  },
  {
    title: 'Side Fall',
    id: 6,
  },
  {
    title: 'Sticky Up ',
    id: 7,
  },
  {
    title: '3D Flip (Horizontal)',
    id: 8,
  },
  {
    title: '3D Flip (Vertical) ',
    id: 9,
  },
  {
    title: '3D Sign',
    id: 10,
  },
  {
    title: 'Super Scaled',
    id: 11,
  },
  {
    title: '3D Rotate in Left',
    id: 14,
  },
  {
    title: '3D Rotate in Right',
    id: 16,
  },
  {
    title: '3D Rotate in Top',
    id: 15,
  },
  {
    title: '3D Rotate in Bottom',
    id: 13,
  },
] as const;
