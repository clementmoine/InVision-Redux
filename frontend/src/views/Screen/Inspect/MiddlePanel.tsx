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

  const expandGroupAndParents = useCallback(
    (layer: Layer | undefined) => {
      if (!layer) return;

      const groupsToExpand: Layer['id'][] = [];

      const findParentGroups = (layerId: Layer['id'] | undefined) => {
        if (!layerId) return;
        const layers = getLayersToCheck();
        const parentGroups = layers.filter(
          l =>
            l.type === 'group' && l.layers?.some(child => child.id === layerId),
        );
        parentGroups.forEach(group => {
          if (!expandedGroupIds.includes(group.id)) {
            groupsToExpand.push(group.id);
            findParentGroups(group.id);
          }
        });
      };

      findParentGroups(layer.id);
      if (!expandedGroupIds.includes(layer.id)) {
        groupsToExpand.push(layer.id);
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
        const { id, x, y, width, height, order } = layer;

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
          if (selectedLayer?.id && selectedLayer.id === id) {
            continue;
          }

          if (!foundLayer || order > foundLayer.order) {
            foundLayer = layer;
          }
        }
      }

      return foundLayer;
    },
    [getLayersToCheck, selectedLayer, zoomLevel],
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
          } else {
            // Vérifier si le clic est en dehors de l'image
            if (
              x < 0 ||
              x > screen.width * zoomLevel ||
              y < 0 ||
              y > screen.height * zoomLevel
            ) {
              setSelectedLayer(undefined);
            }
          }
        }
      }
    },
    [
      isSpacePressed,
      getMousePosition,
      findLayerUnderMouse,
      setSelectedLayer,
      screen.width,
      screen.height,
      zoomLevel,
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

  useEffect(() => {
    if (selectedLayer?.id) {
      expandGroupAndParents(selectedLayer);
    }
  }, [expandGroupAndParents, selectedLayer]);

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

  const calculateDistance = useCallback(
    (selectedLayer: Layer | undefined, hoveredLayer: Layer | undefined) => {
      if (!selectedLayer || !hoveredLayer)
        return { distance: 0, x1: 0, y1: 0, x2: 0, y2: 0 };

      const selectedRight = selectedLayer.x + selectedLayer.width;
      const selectedLeft = selectedLayer.x;
      const hoveredRight = hoveredLayer.x + hoveredLayer.width;
      const hoveredLeft = hoveredLayer.x;

      let distance: number;
      let x1: number, y1: number, x2: number, y2: number;

      if (hoveredLeft > selectedRight) {
        // Hovered layer is to the right of the selected layer
        distance = hoveredLeft - selectedRight;
        x1 = selectedRight;
        y1 = selectedLayer.y + selectedLayer.height / 2;
        x2 = hoveredLeft;
        y2 = hoveredLayer.y + hoveredLayer.height / 2;
      } else {
        // Hovered layer is to the left of the selected layer
        distance = selectedLeft - hoveredRight;
        x1 = selectedLeft;
        y1 = selectedLayer.y + selectedLayer.height / 2;
        x2 = hoveredRight;
        y2 = hoveredLayer.y + hoveredLayer.height / 2;
      }

      return {
        distance,
        x1: x1 * 2 * zoomLevel,
        y1: y1 * 2 * zoomLevel,
        x2: x2 * 2 * zoomLevel,
        y2: y2 * 2 * zoomLevel,
      };
    },
    [zoomLevel],
  );

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

  const { distance, x1, y1, x2, y2 } = useMemo(
    () => calculateDistance(selectedLayer, hoveredLayer),
    [calculateDistance, selectedLayer, hoveredLayer],
  );

  return (
    <div
      ref={containerRef}
      className="flex relative bg-muted overflow-auto p-16 h-full"
      style={{
        cursor: isDragging ? 'grabbing' : isSpacePressed ? 'grab' : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Annotations */}
      <div
        id="annotations"
        className="absolute inset-16"
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
        {/* Line between selected and hovered layer */}
        {selectedLayer && hoveredLayer && (
          <>
            {/* Line between selected and hovered layer */}
            <div
              className="absolute"
              style={{
                top: Math.min(y1, y2),
                left: Math.min(x1, x2),
                width: Math.abs(x2 - x1),
                height: '2px', // Line thickness
                backgroundColor: 'blue', // Line color
                transform: 'translateY(-1px)', // Adjust for line thickness
                zIndex: 1,
              }}
            />

            {/* Distance text */}
            <div
              className="absolute text-blue-500"
              style={{
                top: Math.min(y1, y2) - 20,
                left: (x1 + x2) / 2,
                transform: 'translateX(-50%)',
                zIndex: 2,
                backgroundColor: 'white', // Background for better readability
                padding: '2px 5px',
                borderRadius: '4px',
                border: '1px solid blue',
              }}
            >
              {Math.abs(distance)
                .toFixed(2)
                .replace(/\.?0+$/, '')}
              px
            </div>
          </>
        )}

        {/* Hovered layer */}
        {hoveredLayer && (
          <div
            className="text-blue-500 outline outline-current absolute"
            style={{
              top: hoveredLayer.y * 2 * zoomLevel,
              left: hoveredLayer.x * 2 * zoomLevel,
              width: hoveredLayer.width * 2 * zoomLevel,
              height: hoveredLayer.height * 2 * zoomLevel,
            }}
          />
        )}

        {/* Selected layer */}
        {selectedLayer && (
          <div
            className="text-primary  outline outline-current absolute"
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
        className="object-contain mx-auto bg-white select-none pointer-events-none"
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
