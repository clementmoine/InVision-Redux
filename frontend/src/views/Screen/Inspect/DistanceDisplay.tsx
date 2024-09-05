import { cn } from '@/lib/utils';
import { Layer } from '@/types';
import React, { useCallback, useMemo } from 'react';

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

const MIN_VERTICAL_DISTANCE = 24;
const MIN_HORIZONTAL_DISTANCE = 30;

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

  const renderLine = useCallback(
    (
      from: { x: number; y: number },
      to: { x: number; y: number },
      orientation: 'horizontal' | 'vertical',
      type: 'h' | 'solid' | 'dashed',
      color: 'primary' | 'blue',
      visible: boolean,
    ) => {
      if (!visible) return;

      const x1 = from.x;
      const y1 = from.y;
      const x2 = to.x;
      const y2 = to.y;

      const length =
        orientation === 'vertical' ? Math.abs(y2 - y1) : Math.abs(x2 - x1);

      if (length < 3) return;

      const offset = type === 'h' ? 2 : 0;

      const style: React.CSSProperties = {
        left:
          orientation === 'vertical'
            ? `${Math.min(x1, x2)}px`
            : `${Math.min(x1, x2) + offset}px`,
        top:
          orientation === 'vertical'
            ? `${Math.min(y1, y2) + offset}px`
            : `${Math.min(y1, y2)}px`,
      };

      const hSize = 7;

      return (
        <div
          key={`line-${x1}-${y1}-${x2}-${y2}`}
          className={cn(
            'absolute flex justify-center items-center text-primary',
            {
              'text-primary': color === 'primary',
              'text-blue-500': color === 'blue',
            },
          )}
          style={style}
        >
          <div
            key={`line-${x1}-${y1}-${x2}-${y2}`}
            className="border-current"
            style={{
              width:
                orientation === 'horizontal' ? `${length - offset * 2}px` : 1,
              height:
                orientation === 'horizontal' ? 1 : `${length - offset * 2}px`,
              backgroundColor:
                type === 'solid' || type === 'h' ? 'currentColor' : undefined,
              backgroundImage:
                type === 'dashed'
                  ? `linear-gradient(${orientation === 'horizontal' ? '90deg' : '0deg'}, currentColor, currentColor 75%, transparent 75%, transparent 100%)`
                  : undefined,
              backgroundSize:
                type === 'dashed'
                  ? orientation === 'horizontal'
                    ? '6px 4px'
                    : '4px 6px'
                  : undefined,
            }}
          />

          {type === 'h' && (
            <div
              key={`bar-top-${x1}-${y1}`}
              className="flex absolute bg-current"
              style={{
                top: orientation === 'horizontal' ? undefined : 0,
                left: orientation === 'horizontal' ? 0 : undefined,
                width: orientation === 'horizontal' ? 1 : hSize,
                height: orientation === 'horizontal' ? hSize : 1,
              }}
            />
          )}

          {type === 'h' && (
            <div
              key={`bar-bottom-${x2}-${y2}`}
              className="flex absolute bg-current"
              style={{
                bottom: orientation === 'horizontal' ? undefined : 0,
                right: orientation === 'horizontal' ? 0 : undefined,
                width: orientation === 'horizontal' ? 1 : hSize,
                height: orientation === 'horizontal' ? hSize : 1,
              }}
            />
          )}
        </div>
      );
    },
    [],
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
        hLeft <= sLeft &&
        hRight >= sRight &&
        hTop <= sTop &&
        hBottom >= sBottom
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
        console.info(
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
      if (!distance) return null;

      const { value, from, to } = distance;
      const absDistance = Math.abs(value);

      // Manage 0 and exponential numbers
      if (absDistance.toFixed(2).replace(/\.?0+$/, '') === '0') return null;

      const formattedDistance = `${absDistance.toFixed(2).replace(/\.?0+$/, '')}px`;

      const style: React.CSSProperties = {
        transform: 'translate(-50%, -50%)',
      };
      const midPoint: { x: number; y: number } = { x: 0, y: 0 };

      const line: {
        from: { x: number; y: number };
        to: { x: number; y: number };
        orientation: 'horizontal' | 'vertical';
        type: 'dashed' | 'h';
        visible: boolean;
        color: 'primary' | 'blue';
      } = {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
        orientation: 'horizontal',
        type: 'h',
        visible: true, // Debug
        color: 'primary',
      };

      const hoverLine: {
        from: { x: number; y: number };
        to: { x: number; y: number };
        orientation: 'horizontal' | 'vertical';
        type: 'dashed' | 'h';
        visible: boolean;
        color: 'primary' | 'blue';
      } = {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
        orientation: 'horizontal',
        type: 'dashed',
        visible: true, // Debug
        color: 'blue',
      };

      const layerOutlineWidth = 2;

      switch (position) {
        case 'top':
          midPoint.x = sLeft + sWidth / 2;

          line.from.x = midPoint.x * 2 * zoomLevel;
          line.to.x = midPoint.x * 2 * zoomLevel;
          line.orientation = 'vertical';

          // Move the measure to the top if distance is too short for readability
          if (absDistance * 2 * zoomLevel < MIN_VERTICAL_DISTANCE) {
            style.transform = `translate(-50%, calc(-100% - 8px))`;
          }

          // Hovered layer is nested in selected layer
          if (from === 'hTop' && to === 'sTop') {
            midPoint.x = hLeft + hWidth / 2;

            line.from.x = midPoint.x * 2 * zoomLevel;
            line.to.x = midPoint.x * 2 * zoomLevel;

            midPoint.y = hTop - Math.abs(hTop - sTop) / 2;

            line.from.y = hTop * 2 * zoomLevel - 2;
            line.to.y = sTop * 2 * zoomLevel;
          }
          // Selected layer is nested in hovered layer
          else if (from === 'sTop' && to === 'hTop') {
            midPoint.y = sTop - Math.abs(hTop - sTop) / 2;

            line.from.y = sTop * 2 * zoomLevel - layerOutlineWidth;
            line.to.y = hTop * 2 * zoomLevel;

            hoverLine.orientation = 'horizontal';
            hoverLine.from = { x: line.from.x, y: hTop * 2 * zoomLevel - 1 };
            hoverLine.to = {
              x: hLeft * 2 * zoomLevel,
              y: hTop * 2 * zoomLevel - 1,
            };
          }
          // Hovered layer is at the top of the selected layer
          else if (from === 'sTop' && to === 'hBottom') {
            midPoint.y = sTop - Math.abs(sTop - hBottom) / 2;

            line.from.y = sTop * 2 * zoomLevel - layerOutlineWidth;
            line.to.y = hBottom * 2 * zoomLevel + layerOutlineWidth;

            hoverLine.orientation = 'horizontal';
            hoverLine.from = { x: line.from.x, y: hBottom * 2 * zoomLevel + 1 };
            hoverLine.to = {
              x: hLeft * 2 * zoomLevel,
              y: hBottom * 2 * zoomLevel + 1,
            };
          }
          // Unhandled
          else {
            console.info('Unhandled top', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'bottom':
          midPoint.x = sLeft + sWidth / 2;

          line.from.x = midPoint.x * 2 * zoomLevel;
          line.to.x = midPoint.x * 2 * zoomLevel;
          line.orientation = 'vertical';

          // Move the measure to the bottom if distance is too short for readability
          if (absDistance * 2 * zoomLevel < MIN_VERTICAL_DISTANCE) {
            style.transform = `translate(-50%, calc(0% + 8px))`;
          }

          // Selected layer is nested in the hovered layer
          if (from === 'hBottom' && to === 'sBottom') {
            midPoint.y = hBottom - Math.abs(hBottom - sBottom) / 2;

            line.from.y = hBottom * 2 * zoomLevel;
            line.to.y = sBottom * 2 * zoomLevel + layerOutlineWidth;

            hoverLine.orientation = 'horizontal';
            hoverLine.from = { x: line.from.x, y: hBottom * 2 * zoomLevel };
            hoverLine.to = {
              x: hLeft * 2 * zoomLevel,
              y: hBottom * 2 * zoomLevel,
            };
          }
          // Hovered layer is nested in selected layer
          else if (from === 'sBottom' && to === 'hBottom') {
            midPoint.x = hLeft + hWidth / 2;

            line.from.x = midPoint.x * 2 * zoomLevel;
            line.to.x = midPoint.x * 2 * zoomLevel;

            midPoint.y = sBottom - Math.abs(sBottom - hBottom) / 2;

            line.from.y = hBottom * 2 * zoomLevel + layerOutlineWidth;
            line.to.y = sBottom * 2 * zoomLevel;
          }
          // Hovered layer is at the bottom of the selected layer
          else if (from === 'hTop' && to === 'sBottom') {
            midPoint.y = hTop - Math.abs(hTop - sBottom) / 2;

            line.from.y = hTop * 2 * zoomLevel - layerOutlineWidth;
            line.to.y = sBottom * 2 * zoomLevel + layerOutlineWidth;

            hoverLine.orientation = 'horizontal';
            hoverLine.from = { x: line.from.x, y: hTop * 2 * zoomLevel - 2 };
            hoverLine.to = {
              x: hLeft * 2 * zoomLevel,
              y: hTop * 2 * zoomLevel - 2,
            };
          }
          // Unhandled
          else {
            console.info('Unhandled bottom', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'left':
          midPoint.y = sTop + sHeight / 2;

          line.from.y = midPoint.y * 2 * zoomLevel;
          line.to.y = midPoint.y * 2 * zoomLevel;
          line.orientation = 'horizontal';

          // Move the measure to the left if distance is too short for readability
          if (absDistance * 2 * zoomLevel < MIN_HORIZONTAL_DISTANCE) {
            style.transform = `translate(calc(-100% - 12px), -50%)`;
          }

          // Hovered layer is at the left of the selected layer
          if (from === 'sLeft' && to === 'hRight') {
            midPoint.x = sLeft - Math.abs(sLeft - hRight) / 2;

            line.from.x = sLeft * 2 * zoomLevel - layerOutlineWidth;
            line.to.x = hRight * 2 * zoomLevel + layerOutlineWidth;

            hoverLine.orientation = 'vertical';
            hoverLine.from = {
              x: hRight * 2 * zoomLevel + 1,
              y: hTop * 2 * zoomLevel,
            };
            hoverLine.to = {
              x: hRight * 2 * zoomLevel + 1,
              y: line.to.y,
            };
          }
          // Selected layer is nested in the hovered layer
          else if (from === 'sLeft' && to === 'hLeft') {
            midPoint.x = sLeft - Math.abs(sLeft - hLeft) / 2;

            line.from.x = sLeft * 2 * zoomLevel - layerOutlineWidth;
            line.to.x = hLeft * 2 * zoomLevel;

            hoverLine.orientation = 'vertical';
            hoverLine.from = {
              x: hLeft * 2 * zoomLevel - 1,
              y: hTop * 2 * zoomLevel,
            };
            hoverLine.to = {
              x: hLeft * 2 * zoomLevel - 1,
              y: line.to.y,
            };
          }
          // Hovered layer is nested in the selected layer
          else if (from === 'hLeft' && to === 'sLeft') {
            midPoint.y = hTop + hHeight / 2;

            line.from.y = midPoint.y * 2 * zoomLevel;
            line.to.y = midPoint.y * 2 * zoomLevel;

            midPoint.x = hLeft - Math.abs(hLeft - sLeft) / 2;

            line.from.x = hLeft * 2 * zoomLevel - layerOutlineWidth;
            line.to.x = sLeft * 2 * zoomLevel;
          }
          // Unhandled
          else {
            console.info('Unhandled left', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        case 'right':
          midPoint.y = sTop + sHeight / 2;

          line.from.y = midPoint.y * 2 * zoomLevel;
          line.to.y = midPoint.y * 2 * zoomLevel;
          line.orientation = 'horizontal';

          // Move the measure to the right if distance is too short for readability
          if (absDistance * 2 * zoomLevel < MIN_HORIZONTAL_DISTANCE) {
            style.transform = `translate(calc(0% + 12px), -50%)`;
          }

          // Hovered layer is at left of the selected layer
          if (from === 'hLeft' && to === 'sRight') {
            midPoint.x = hLeft - Math.abs(hLeft - sRight) / 2;

            line.from.x = hLeft * 2 * zoomLevel - layerOutlineWidth;
            line.to.x = sRight * 2 * zoomLevel + layerOutlineWidth;

            hoverLine.orientation = 'vertical';
            hoverLine.from = {
              x: hLeft * 2 * zoomLevel - 2,
              y: hTop * 2 * zoomLevel,
            };
            hoverLine.to = { x: hLeft * 2 * zoomLevel - 2, y: line.to.y };
          }
          // Hovered layer nested in selected layer
          else if (from === 'sRight' && to === 'hRight') {
            midPoint.y = hTop + hHeight / 2;

            line.from.y = midPoint.y * 2 * zoomLevel;
            line.to.y = midPoint.y * 2 * zoomLevel;

            midPoint.x = sRight - Math.abs(sRight - hRight) / 2;

            line.from.x = sRight * 2 * zoomLevel;
            line.to.x = hRight * 2 * zoomLevel + layerOutlineWidth;
          }
          // Selected layer nested in hovered layer
          else if (from === 'hRight' && to === 'sRight') {
            midPoint.x = hRight - Math.abs(hRight - sRight) / 2;

            line.from.x = hRight * 2 * zoomLevel;
            line.to.x = sRight * 2 * zoomLevel + layerOutlineWidth;
          }
          // Unhandled
          else {
            console.info('Unhandled right', from, to);
          }

          style.left = midPoint.x * 2 * zoomLevel;
          style.top = midPoint.y * 2 * zoomLevel;
          break;
        default:
          break;
      }

      return (
        <>
          {/* Measure */}
          <div
            className="absolute bg-primary text-white rounded-sm text-[10px] p-[2px] z-[5000]"
            style={style}
          >
            {formattedDistance}
          </div>

          {/* Lines */}
          {renderLine(
            line.from,
            line.to,
            line.orientation,
            line.type,
            line.color,
            line.visible,
          )}
          {hoveredLayer &&
            hoveredLayer.id !== 'CANVAS_LAYER' &&
            renderLine(
              hoverLine.from,
              hoverLine.to,
              hoverLine.orientation,
              hoverLine.type,
              hoverLine.color,
              hoverLine.visible,
            )}
        </>
      );
    },
    [
      renderLine,
      sLeft,
      sWidth,
      zoomLevel,
      sTop,
      sHeight,
      hLeft,
      hWidth,
      hTop,
      hBottom,
      sBottom,
      hRight,
      hHeight,
      sRight,
      hoveredLayer,
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
