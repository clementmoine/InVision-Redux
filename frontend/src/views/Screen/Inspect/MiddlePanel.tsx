import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';

import { ArchivedScreenDetails, Screen, Layer, ScreenInspect } from '@/types';
import DistanceDisplay from './DistanceDisplay';
import { cn } from '@/lib/utils';

interface InspectMiddlePanelProps {
  data?: ScreenInspect;
  zoomLevel: number;
  selectedLayer?: Layer;
  hoveredLayer?: Layer;
  expandedGroupIds: Layer['id'][];
  screen: Screen | ArchivedScreenDetails['screen'];
  setHoveredLayer: Dispatch<SetStateAction<Layer | undefined>>;
  setExpandedGroupIds: Dispatch<SetStateAction<Layer['id'][]>>;
  setSelectedLayer: Dispatch<SetStateAction<Layer | undefined>>;
}

function InspectMiddlePanel(props: InspectMiddlePanelProps) {
  const {
    selectedLayer,
    hoveredLayer,
    expandedGroupIds,
    setExpandedGroupIds,
    setHoveredLayer,
    setSelectedLayer,
    screen,
    zoomLevel,
    data,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const scrollPosition = useRef<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten nested layers and add the same group layers if selected
  const getLayersToCheck = useCallback(() => {
    if (!data?.layers) return [];

    const flattenLayers = (layers: Layer[], level: number = 0): Layer[] => {
      let result: Layer[] = [];

      for (const layer of layers) {
        result.push({ ...layer, order: level });
        if (layer.type === 'group' && layer.layers) {
          result = result.concat(flattenLayers(layer.layers, level + 1));
        }
      }

      return result;
    };

    const allLayers = flattenLayers(data.layers);

    if (selectedLayer?.type === 'group' && selectedLayer.layers) {
      allLayers.push(...flattenLayers(selectedLayer.layers));
    }

    // Add the canvas "layer"
    const canvasLayer: Layer = {
      name: 'CANVAS_LAYER',
      id: 'CANVAS_LAYER',
      index: '-1',
      height: data.height,
      width: data.width,
      x: 0,
      y: 0,
      type: 'group',
      order: -1,
      rotation: 0,
      opacity: 1,
      fillColor: [],
      flippedHorizontal: false,
      flippedVertical: false,
      isInitiallyVisible: true,
      exportOptions: [],
    };

    allLayers.push(canvasLayer);

    return allLayers;
  }, [data, selectedLayer]);

  const getMousePosition = useCallback(
    (e: MouseEvent | React.MouseEvent, container: HTMLDivElement | null) => {
      if (!container) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingTop = parseFloat(computedStyle.paddingTop);

      const containerWidth = rect.width - paddingLeft * 2;
      // const containerHeight = rect.height - paddingTop * 2;

      const offsetX = Math.max(
        (containerWidth - screen.width * zoomLevel) / 2,
        0,
      );
      const offsetY = 0;

      const mouseX =
        e.clientX - rect.left - paddingLeft - offsetX + container.scrollLeft;
      const mouseY =
        e.clientY - rect.top - paddingTop - offsetY + container.scrollTop;

      return { x: mouseX, y: mouseY };
    },
    [screen.width, zoomLevel],
  );

  // Expand layer (if group) and parents when grouped
  const expandLayerAndParents = useCallback(
    (layer: Layer | undefined) => {
      if (!layer) return;

      const groupsToExpand = new Set<Layer['id']>();

      const findParentGroups = (layerId: Layer['id'] | undefined) => {
        if (!layerId) return;
        const layers = getLayersToCheck();
        const parentGroups = layers.filter(
          l =>
            l.type === 'group' && l.layers?.some(child => child.id === layerId),
        );
        parentGroups.forEach(group => {
          if (!expandedGroupIds.includes(group.id)) {
            groupsToExpand.add(group.id);
            findParentGroups(group.id);
          }
        });
      };

      findParentGroups(layer.id);
      if (layer.type === 'group') {
        groupsToExpand.add(layer.id);
      }

      setExpandedGroupIds(prev =>
        Array.from(new Set([...prev, ...groupsToExpand])),
      );
    },
    [getLayersToCheck, setExpandedGroupIds, expandedGroupIds],
  );

  // Find the layer under the mouse based on position and priority
  const findLayerUnderMouse = useCallback(
    (mouseX: number, mouseY: number): Layer | null => {
      const layersToCheck = getLayersToCheck();
      if (!layersToCheck.length) return null;

      let foundLayer: Layer | null = null;

      for (const layer of layersToCheck) {
        const { x, y, width, height, order } = layer;

        const layerX = x * 2 * zoomLevel;
        const layerY = y * 2 * zoomLevel;
        const layerWidth = width * 2 * zoomLevel;
        const layerHeight = height * 2 * zoomLevel;

        if (
          mouseX >= layerX &&
          mouseX <= layerX + layerWidth &&
          mouseY >= layerY &&
          mouseY <= layerY + layerHeight
        ) {
          // Ignore the layer if it is already selected
          // if (selectedLayer?.id && selectedLayer.id === layer.id) {
          //   continue;
          // }

          if (!foundLayer || order > foundLayer.order) {
            foundLayer = layer;
          }
        }
      }

      return foundLayer;
    },
    [getLayersToCheck, zoomLevel],
  );

  // Handle mouse down event for dragging or selecting layers
  const handleMouseDown = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (e.button === 0) {
        if (isSpacePressed) {
          setIsDragging(true);
          startPosition.current = { x: e.clientX, y: e.clientY };
          if (containerRef.current) {
            scrollPosition.current = {
              left: containerRef.current.scrollLeft,
              top: containerRef.current.scrollTop,
            };
          }
        } else if (containerRef.current) {
          const { x, y } = getMousePosition(e, containerRef.current);
          const layerUnderMouse = findLayerUnderMouse(x, y);

          if (layerUnderMouse) {
            setSelectedLayer(layerUnderMouse);

            expandLayerAndParents(layerUnderMouse);
          } else {
            setSelectedLayer(undefined);
          }
        }
      }
    },
    [
      isSpacePressed,
      getMousePosition,
      findLayerUnderMouse,
      setSelectedLayer,
      expandLayerAndParents,
    ],
  );

  // Handle mouse move event for dragging or hovering over layers
  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (containerRef.current) {
        if (isDragging) {
          if (startPosition.current) {
            const dx = e.clientX - startPosition.current.x;
            const dy = e.clientY - startPosition.current.y;
            containerRef.current.scrollLeft = scrollPosition.current.left - dx;
            containerRef.current.scrollTop = scrollPosition.current.top - dy;
          }
        } else {
          const { x, y } = getMousePosition(e, containerRef.current);

          const layerUnderMouse = findLayerUnderMouse(x, y);

          if (layerUnderMouse) {
            setHoveredLayer(layerUnderMouse);
          } else {
            setHoveredLayer(undefined);
          }
        }
      }
    },
    [isDragging, getMousePosition, findLayerUnderMouse, setHoveredLayer],
  );

  // Handle mouse up event to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle key down event to detect Space key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsSpacePressed(true);
    }
  }, []);

  // Handle key up event to detect Space key release
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsSpacePressed(false);
      setIsDragging(false); // Stop dragging when space is released
    }
  }, []);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('mousemove', handleMouseMove);
      containerElement.addEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('mousemove', handleMouseMove);
        containerElement.removeEventListener('mouseup', handleMouseUp);
      }

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp]);

  const measures = useMemo<
    | undefined
    | {
        color: 'primary' | 'blue';
        x: number;
        y: number;
        width: number;
        height: number;
      }
  >(() => {
    const isSelectedLayer =
      selectedLayer != null &&
      selectedLayer.id !== 'CANVAS_LAYER' &&
      (hoveredLayer == null || hoveredLayer.id === selectedLayer.id);
    const isHoveredLayer =
      hoveredLayer != null &&
      hoveredLayer.id !== 'CANVAS_LAYER' &&
      (selectedLayer == null || selectedLayer.id === 'CANVAS_LAYER');

    return isHoveredLayer || isSelectedLayer
      ? {
          color: isSelectedLayer ? 'primary' : 'blue',
          x: isSelectedLayer ? selectedLayer.x : hoveredLayer!.x,
          y: isSelectedLayer ? selectedLayer.y : hoveredLayer!.y,
          width: isSelectedLayer ? selectedLayer.width : hoveredLayer!.width,
          height: isSelectedLayer ? selectedLayer.height : hoveredLayer!.height,
        }
      : undefined;
  }, [selectedLayer, hoveredLayer]);

  return (
    <div
      ref={containerRef}
      className={cn('flex relative bg-muted overflow-auto p-16 h-full', {
        'cursor-grabbing': isSpacePressed,
      })}
      onMouseDown={handleMouseDown}
    >
      {/* Annotations */}
      <div
        id="annotations"
        className="absolute inset-16 mx-auto"
        style={{
          width: screen.width * zoomLevel,
          height: screen.height * zoomLevel,
          minWidth: screen.width * zoomLevel,
          minHeight: screen.height * zoomLevel,
          maxWidth: screen.width * zoomLevel,
          maxHeight: screen.height * zoomLevel,
          aspectRatio: `${screen.width} / ${screen.height}`,
        }}
      >
        {/* Distance */}
        {selectedLayer &&
          selectedLayer.id !== 'CANVAS_LAYER' &&
          hoveredLayer && (
            <DistanceDisplay
              zoomLevel={zoomLevel}
              selectedLayer={selectedLayer}
              hoveredLayer={hoveredLayer}
            />
          )}

        {/* Hovered layer */}
        {hoveredLayer && hoveredLayer.id !== 'CANVAS_LAYER' && (
          <div
            className="text-blue-500 outline outline-current absolute outline-[2px]"
            style={{
              top: hoveredLayer.y * 2 * zoomLevel,
              left: hoveredLayer.x * 2 * zoomLevel,
              width: hoveredLayer.width * 2 * zoomLevel,
              height: hoveredLayer.height * 2 * zoomLevel,
            }}
          />
        )}

        {/* Measures of hover / selected layer */}
        {measures && (
          <div
            className={cn('absolute  text-white p-[2px] text-[10px]', {
              ['bg-primary']: measures.color === 'primary',
              ['bg-blue-500']: measures.color === 'blue',
            })}
            style={{
              top: (measures.y + measures.height) * 2 * zoomLevel,
              left: measures.x * 2 * zoomLevel - 2,
            }}
          >
            {`${Number(measures.height)
              .toFixed(2)
              .replace(/\.?0+$/, '')}x${Number(measures.height)
              .toFixed(2)
              .replace(/\.?0+$/, '')}`}
          </div>
        )}

        {/* Selected layer */}
        {selectedLayer && selectedLayer.id !== 'CANVAS_LAYER' && (
          <div
            className="text-primary outline outline-current absolute outline-[2px]"
            style={{
              top: selectedLayer.y * 2 * zoomLevel,
              left: selectedLayer.x * 2 * zoomLevel,
              width: selectedLayer.width * 2 * zoomLevel,
              height: selectedLayer.height * 2 * zoomLevel,
            }}
          >
            {/* Top-left corner */}
            <div className="absolute w-2 h-2 border border-current bg-white -top-1 -left-1" />
            {/* Top-right corner */}
            <div className="absolute w-2 h-2 border border-current bg-white -top-1 -right-1" />
            {/* Bottom-left corner */}
            <div className="absolute w-2 h-2 border border-current bg-white -bottom-1 -left-1" />
            {/* Bottom-right corner */}
            <div className="absolute w-2 h-2 border border-current bg-white -bottom-1 -right-1" />
          </div>
        )}
      </div>

      {/* Image */}
      <img
        decoding="sync"
        src={`/api/static/${screen.imageUrl}`}
        className="object-contain mx-auto select-none pointer-events-none bg-[rgb(var(--screen-background-color))]"
        style={{
          width: screen.width * zoomLevel,
          height: screen.height * zoomLevel,
          minWidth: screen.width * zoomLevel,
          minHeight: screen.height * zoomLevel,
          maxWidth: screen.width * zoomLevel,
          maxHeight: screen.height * zoomLevel,
          aspectRatio: `${screen.width} / ${screen.height}`,
        }}
      />
    </div>
  );
}

InspectMiddlePanel.displayName = 'InspectMiddlePanel';

export default InspectMiddlePanel;
