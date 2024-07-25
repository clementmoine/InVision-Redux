import React, { useCallback, useMemo } from 'react';

interface Layer {
  x: number;
  y: number;
  width: number;
  height: number;
}

type VerticalSource = 'hRight' | 'hLeft' | 'sRight' | 'sLeft';
type HorizontalSource = 'hTop' | 'hBottom' | 'sTop' | 'sBottom';

interface DistanceProps {
  from: HorizontalSource | VerticalSource;
  to: HorizontalSource | VerticalSource;
  value: number;
}

interface DistanceDisplayProps {
  zoomLevel: number;
  selectedLayer?: Layer;
  hoveredLayer?: Layer;
}

const MIN_DISTANCE = 25;

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  zoomLevel,
  selectedLayer,
  hoveredLayer,
}) => {
  // Positions et dimensions des couches
  const {
    x: sLeft = 0,
    y: sTop = 0,
    width: sWidth = 0,
    height: sHeight = 0,
  } = selectedLayer || {};

  const {
    x: hLeft = 0,
    y: hTop = 0,
    width: hWidth = 0,
    height: hHeight = 0,
  } = hoveredLayer || {};

  const sBottom = useMemo(
    () => sTop + (selectedLayer?.height || 0),
    [sTop, selectedLayer?.height],
  );
  const sRight = useMemo(
    () => sLeft + (selectedLayer?.width || 0),
    [sLeft, selectedLayer?.width],
  );

  const hBottom = useMemo(
    () => (hTop || 0) + (hoveredLayer?.height || 0),
    [hTop, hoveredLayer?.height],
  );
  const hRight = useMemo(
    () => (hLeft || 0) + (hoveredLayer?.width || 0),
    [hLeft, hoveredLayer?.width],
  );

  const calculateDistances = useCallback(
    (selectedLayer: Layer | undefined, hoveredLayer: Layer | undefined) => {
      if (!selectedLayer || !hoveredLayer) {
        return {
          top: undefined,
          bottom: undefined,
          left: undefined,
          right: undefined,
        };
      }

      let top:
        | { from: HorizontalSource; to: HorizontalSource; value: number }
        | undefined;
      let right:
        | { from: VerticalSource; to: VerticalSource; value: number }
        | undefined;
      let bottom:
        | { from: HorizontalSource; to: HorizontalSource; value: number }
        | undefined;
      let left:
        | { from: VerticalSource; to: VerticalSource; value: number }
        | undefined;

      // Case : The hovered layer is at the left of the selection
      if (hRight <= sLeft && hBottom > sTop && hTop < sBottom) {
        left = {
          from: 'sLeft',
          to: 'hRight',
          value: sLeft - hRight,
        };

        top = {
          from: 'sTop',
          to: 'hBottom',
          value: Math.max(0, sTop - hBottom),
        };

        bottom = {
          from: 'hTop',
          to: 'sBottom',
          value: Math.max(0, hTop - sBottom),
        };
      }

      // Case : The hovered layer is at the right of the selection
      else if (hLeft >= sRight && hBottom > sTop && hTop < sBottom) {
        right = {
          from: 'hLeft',
          to: 'sRight',
          value: hLeft - sRight,
        };

        top = {
          from: 'sTop',
          to: 'hBottom',
          value: Math.max(0, sTop - hBottom),
        };

        bottom = {
          from: 'hTop',
          to: 'sBottom',
          value: Math.max(0, hTop - sBottom),
        };
      }

      // Case : The hovered layer is at the bottom of the selection
      else if (hTop >= sBottom && hRight > sLeft && hLeft < sRight) {
        bottom = {
          from: 'hTop',
          to: 'sBottom',
          value: hTop - sBottom,
        };

        left = {
          from: 'sLeft',
          to: 'hRight',
          value: Math.max(0, sLeft - hRight),
        };

        right = {
          from: 'hLeft',
          to: 'sRight',
          value: Math.max(0, hLeft - sRight),
        };
      }

      // Case : The hovered layer is at the top of the selection
      else if (hBottom <= sTop && hRight > sLeft && hLeft < sRight) {
        top = {
          from: 'sTop',
          to: 'hBottom',
          value: sTop - hBottom,
        };

        left = {
          from: 'sLeft',
          to: 'hRight',
          value: Math.max(0, sLeft - hRight),
        };

        right = {
          from: 'hLeft',
          to: 'sRight',
          value: Math.max(0, hLeft - sRight),
        };
      }

      // Case : The hovered layer is contained by the selection
      else if (
        hLeft < sLeft &&
        hRight > sRight &&
        hTop < sTop &&
        hBottom > sBottom
      ) {
        top = {
          from: 'sTop',
          to: 'hTop',
          value: sTop - hTop,
        };

        bottom = {
          from: 'hBottom',
          to: 'sBottom',
          value: hBottom - sBottom,
        };

        left = {
          from: 'sLeft',
          to: 'hLeft',
          value: sLeft - hLeft,
        };

        right = {
          from: 'hRight',
          to: 'sRight',
          value: hRight - sRight,
        };
      }

      // Case : The hovered layer hugs the selection
      else if (
        hLeft >= sLeft &&
        hRight <= sRight &&
        hTop >= sTop &&
        hBottom <= sBottom
      ) {
        top = {
          from: 'hTop',
          to: 'sTop',
          value: hTop - sTop,
        };

        bottom = {
          from: 'sBottom',
          to: 'hBottom',
          value: sBottom - hBottom,
        };

        left = {
          from: 'hLeft',
          to: 'sLeft',
          value: hLeft - sLeft,
        };

        right = {
          from: 'sRight',
          to: 'hRight',
          value: sRight - hRight,
        };
      }

      // Case : The hovered layer is partially covering the selection horizontally
      else if (
        hLeft < sRight &&
        hRight > sLeft &&
        hTop >= sTop &&
        hBottom <= sBottom
      ) {
        // Horizontal
        if (hLeft < sLeft) {
          left = {
            from: 'sLeft',
            to: 'hLeft',
            value: sLeft - hLeft,
          };
        } else if (hRight > sRight) {
          right = {
            from: 'hRight',
            to: 'sRight',
            value: hRight - sRight,
          };
        }

        // Vertical
        if (hTop < sTop) {
          top = {
            from: 'sTop',
            to: 'hTop',
            value: sTop - hTop,
          };
        } else if (hBottom > sBottom) {
          bottom = {
            from: 'hBottom',
            to: 'sBottom',
            value: hBottom - sBottom,
          };
        }
      }

      // Case : The hovered layer is partially covering the selection vertically
      else if (
        hTop < sBottom &&
        hBottom > sTop &&
        hLeft >= sLeft &&
        hRight <= sRight
      ) {
        // Vertical
        if (hTop < sTop) {
          top = {
            from: 'sTop',
            to: 'hTop',
            value: sTop - hTop,
          };
        } else if (hBottom > sBottom) {
          bottom = {
            from: 'hBottom',
            to: 'sBottom',
            value: hBottom - sBottom,
          };
        }

        // Horizontal
        if (hLeft < sLeft) {
          left = {
            from: 'sLeft',
            to: 'hLeft',
            value: sLeft - hLeft,
          };
        } else if (hRight > sRight) {
          right = {
            from: 'hRight',
            to: 'sRight',
            value: hRight - sRight,
          };
        }
      }

      // Case : The hovered layer is partially covering the selection in both directions
      else if (
        hLeft < sRight &&
        hRight > sLeft &&
        hTop < sBottom &&
        hBottom > sTop
      ) {
        // Horizontal
        if (hLeft < sLeft) {
          left = {
            from: 'sLeft',
            to: 'hLeft',
            value: sLeft - hLeft,
          };
        } else if (hRight > sRight) {
          right = {
            from: 'hRight',
            to: 'sRight',
            value: hRight - sRight,
          };
        }

        // Vertical
        if (hTop < sTop) {
          top = {
            from: 'sTop',
            to: 'hTop',
            value: sTop - hTop,
          };
        } else if (hBottom > sBottom) {
          bottom = {
            from: 'hBottom',
            to: 'sBottom',
            value: hBottom - sBottom,
          };
        }
      }

      // Case : The hovered layer is off-centered by the bottom right of the selection
      else if (hTop >= sBottom && hLeft >= sRight) {
        bottom = {
          from: 'hTop',
          to: 'sBottom',
          value: hTop - sBottom,
        };

        right = {
          from: 'hLeft',
          to: 'sRight',
          value: hLeft - sRight,
        };
      }

      // Case : The hovered layer is off-centered by the top right of the selection
      else if (hBottom <= sTop && hLeft >= sRight) {
        top = {
          from: 'sTop',
          to: 'hBottom',
          value: sTop - hBottom,
        };

        right = {
          from: 'hLeft',
          to: 'sRight',
          value: hLeft - sRight,
        };
      }

      // Case : The hovered layer is off-centered by the bottom left of the selection
      else if (hTop >= sBottom && hRight <= sLeft) {
        bottom = {
          from: 'hTop',
          to: 'sBottom',
          value: hTop - sBottom,
        };

        left = {
          from: 'sLeft',
          to: 'hRight',
          value: sLeft - hRight,
        };
      }

      // Case : The hovered layer is off-centered by the top left of the selection
      else if (hBottom <= sTop && hRight <= sLeft) {
        top = {
          from: 'sTop',
          to: 'hBottom',
          value: sTop - hBottom,
        };

        left = {
          from: 'sLeft',
          to: 'hRight',
          value: sLeft - hRight,
        };
      }

      // Unhandled case
      else {
        console.log(
          'not handled case',
          { hTop, hRight, hBottom, hLeft, hHeight, hWidth },
          { sTop, sRight, sBottom, sLeft, sHeight, sWidth },
        );
      }
      return { top, bottom, left, right };
    },
    [
      hBottom,
      hHeight,
      hLeft,
      hRight,
      hTop,
      hWidth,
      sBottom,
      sHeight,
      sLeft,
      sRight,
      sTop,
      sWidth,
    ],
  );

  const { top, bottom, left, right } = useMemo(
    () => calculateDistances(selectedLayer, hoveredLayer),
    [calculateDistances, selectedLayer, hoveredLayer],
  );

  const renderDistance = useCallback(
    (
      distance: DistanceProps | undefined,
      position: 'top' | 'bottom' | 'left' | 'right',
    ) => {
      if (!distance || distance.value === 0) return null;

      const { value, from, to } = distance;
      const absDistance = Math.abs(value);

      const style: React.CSSProperties = {
        transform: 'translate(-50%, -50%)',
      };
      const midPoint: { x: number; y: number } = { x: 0, y: 0 };

      switch (position) {
        case 'top':
          midPoint.x = sLeft + sWidth / 2;

          if (absDistance * 2 * zoomLevel < MIN_DISTANCE) {
            style.transform = `translate(-50%, calc(-100% - 8px))`;
          }

          if (from === 'hTop' && to === 'sTop') {
            midPoint.y = hTop - Math.abs(hTop - sTop) / 2;
          } else if (from === 'sTop' && to === 'hTop') {
            midPoint.y = sTop - Math.abs(hTop - sTop) / 2;
          } else if (from === 'sTop' && to === 'hBottom') {
            midPoint.y = sTop - Math.abs(sTop - hBottom) / 2;
          } else {
            console.info('unhandled top', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'bottom':
          midPoint.x = sLeft + sWidth / 2;

          if (absDistance * 2 * zoomLevel < MIN_DISTANCE) {
            style.transform = `translate(-50%, calc(0% + 8px))`;
          }

          if (from === 'hBottom' && to === 'sBottom') {
            midPoint.y = hBottom - Math.abs(hBottom - sBottom) / 2;
          } else if (from === 'sBottom' && to === 'hBottom') {
            midPoint.y = sBottom - Math.abs(sBottom - hBottom) / 2;
          } else if (from === 'hTop' && to === 'sBottom') {
            midPoint.y = hTop - Math.abs(hTop - sBottom) / 2;
          } else {
            console.info('unhandled bottom', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'left':
          midPoint.y = sTop + sHeight / 2;

          if (absDistance * 2 * zoomLevel < MIN_DISTANCE) {
            style.transform = `translate(calc(-100% - 8px), -50%)`;
          }

          if (from === 'sLeft' && to === 'hRight') {
            midPoint.x = sLeft - Math.abs(sLeft - hRight) / 2;
          } else if (from === 'sLeft' && to === 'hLeft') {
            midPoint.x = sLeft - Math.abs(sLeft - hLeft) / 2;
          } else if (from === 'hLeft' && to === 'sLeft') {
            midPoint.x = hLeft - Math.abs(hLeft - sLeft) / 2;
          } else {
            console.info('unhandled left', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'right':
          midPoint.y = sTop + sHeight / 2;

          if (absDistance * 2 * zoomLevel < MIN_DISTANCE) {
            style.transform = `translate(calc(0% + 8px), -50%)`;
          }

          if (from === 'hLeft' && to === 'sRight') {
            midPoint.x = hLeft - Math.abs(hLeft - sRight) / 2;
          } else if (from === 'sRight' && to === 'hRight') {
            midPoint.x = sRight - Math.abs(sRight - hRight) / 2;
          } else if (from === 'hRight' && to === 'sRight') {
            midPoint.x = hRight - Math.abs(hRight - sRight) / 2;
          } else {
            console.info('unhandled right', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        default:
          break;
      }

      return (
        <div
          className="absolute bg-primary text-white rounded-sm"
          style={{
            ...style,
            fontSize: 10,
            padding: 2,
            zIndex: 5000,
          }}
        >
          {absDistance.toFixed(2).replace(/\.?0+$/, '')}px
        </div>
      );
    },
    [
      sLeft,
      sWidth,
      sTop,
      sHeight,
      hTop,
      hBottom,
      sBottom,
      hRight,
      hLeft,
      sRight,
      zoomLevel,
    ],
  );

  return (
    <>
      {top && renderDistance(top, 'top')}
      {bottom && renderDistance(bottom, 'bottom')}
      {left && renderDistance(left, 'left')}
      {right && renderDistance(right, 'right')}
    </>
  );
};

DistanceDisplay.displayName = 'DistanceDisplay';

export default DistanceDisplay;
