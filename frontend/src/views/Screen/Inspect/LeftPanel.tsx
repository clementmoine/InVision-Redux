import {
  useCallback,
  useMemo,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  Component,
  CopyMinus,
  CopyPlus,
  Folder,
  FolderOpen,
  Image,
  Spline,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ArchivedScreenDetails, Layer, ScreenInspect } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ToDo from '@/assets/illustrations/to-do.svg?react';
import { Spinner } from '@/components/Spinner';

interface InspectLeftPanelProps {
  data?: ScreenInspect | null;
  hoveredLayer?: Layer;
  isFetching?: boolean;
  selectedLayer?: Layer;
  expandedGroupIds: Layer['id'][];
  screen: Screen | ArchivedScreenDetails['screen'];
  setHoveredLayer: Dispatch<SetStateAction<Layer | undefined>>;
  setSelectedLayer: Dispatch<SetStateAction<Layer | undefined>>;
  setExpandedGroupIds: Dispatch<SetStateAction<Layer['id'][]>>;
}

function InspectLeftPanel(props: InspectLeftPanelProps) {
  const {
    data,
    screen,
    isFetching = false,
    hoveredLayer,
    selectedLayer,
    setHoveredLayer,
    setSelectedLayer,
    expandedGroupIds,
    setExpandedGroupIds,
  } = props;

  const renderLayer = useCallback(
    (layer: Layer, level = 0) => {
      const isSelected = selectedLayer ? selectedLayer.id === layer.id : false;
      const isHovered = hoveredLayer ? hoveredLayer.id === layer.id : false;

      if (layer.type === 'group' && layer.layers) {
        const isExpanded = expandedGroupIds.includes(layer.id);

        return (
          <AccordionItem key={layer.id} value={layer.id} className="border-b-0">
            <AccordionTrigger
              className={cn(
                'p-2 overflow-hidden rounded-lg transition-all !no-underline gap-3',
                {
                  'text-muted-foreground hover:bg-muted': !isSelected,
                  'bg-muted': isHovered,
                  'bg-primary-foreground text-primary': isSelected,
                },
              )}
              style={{ paddingLeft: level ? `${level * 1.5}rem` : undefined }}
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                // Force the user to "double click the group to close it"
                if (!isSelected && isExpanded) {
                  e.preventDefault();
                }

                setSelectedLayer(layer);
              }}
              onMouseOver={() => setHoveredLayer(layer)}
              onMouseOut={() => setHoveredLayer(undefined)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Layer icon */}
                {layer.symbol ? (
                  <Component className="h-4 w-4 shrink-0 text-primary" />
                ) : isExpanded ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-primary" />
                )}

                <span className="text-sm text-left text-ellipsis whitespace-nowrap overflow-hidden">
                  {layer.name}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="p-0">
              {layer.layers.map(layer => renderLayer(layer, level + 1))}
            </AccordionContent>
          </AccordionItem>
        );
      }

      return (
        <a
          href="#"
          role="button"
          key={layer.id}
          onClick={() => setSelectedLayer(layer)}
          onMouseOver={() => setHoveredLayer(layer)}
          onMouseOut={() => setHoveredLayer(undefined)}
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-all',
            {
              'text-muted-foreground hover:bg-stone-50 hover:text-neutral-500':
                !isSelected,
              'bg-stone-50 text-neutral-500': isHovered,
              'bg-primary-foreground text-primary': isSelected,
            },
          )}
          style={{ paddingLeft: level ? `${level * 1.5}rem` : undefined }}
        >
          {layer.type === 'text' ? (
            <Type className="h-4 w-4 shrink-0" />
          ) : layer.type === 'bitmap' ? (
            <Image className="h-4 w-4 shrink-0" />
          ) : (
            <Spline className="h-4 w-4 shrink-0" />
          )}

          <span className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
            {layer.name}
          </span>
        </a>
      );
    },
    [
      expandedGroupIds,
      selectedLayer,
      hoveredLayer,
      setHoveredLayer,
      setSelectedLayer,
    ],
  );

  const layers = useMemo(() => {
    if (data?.layers) return data.layers.map(layer => renderLayer(layer));
  }, [data?.layers, renderLayer]);

  const groupIds = useMemo(() => {
    const getGroupIds = (layers: Layer[]): string[] => {
      return layers.reduce<string[]>((acc, layer) => {
        if (layer.type === 'group') {
          acc.push(layer.id);
          if (layer.layers) {
            acc = acc.concat(getGroupIds(layer.layers));
          }
        }
        return acc;
      }, []);
    };

    return data?.layers ? getGroupIds(data?.layers) : [];
  }, [data?.layers]);

  const toggleGroups = useCallback(() => {
    setExpandedGroupIds(expandedGroupIds => {
      if (expandedGroupIds.length > 0) {
        return [];
      }

      return groupIds;
    });
  }, [groupIds, setExpandedGroupIds]);

  return (
    <div className="bg-background p-4 overflow-auto h-full relative">
      <div className="flex items-center gap-2 justify-between pb-2">
        <h2 className="text-sm">
          {data?.name ?? ('name' in screen && screen.name)}
        </h2>

        {data != null && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg flex-shrink-0"
                aria-label={
                  expandedGroupIds.length > 0
                    ? 'Collapse all groups'
                    : 'Expand all groups'
                }
                onClick={toggleGroups}
              >
                {expandedGroupIds.length > 0 ? (
                  <CopyMinus className="size-4" />
                ) : (
                  <CopyPlus className="size-4" />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent side="bottom" sideOffset={5}>
              {expandedGroupIds.length > 0
                ? 'Collapse all groups'
                : 'Expand all groups'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isFetching && (
        <div className="absolute bg-background/50 flex inset-0 h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
          <Spinner />
        </div>
      )}

      {data != null ? (
        <Accordion
          type="multiple"
          value={expandedGroupIds}
          onValueChange={setExpandedGroupIds}
        >
          {layers}
        </Accordion>
      ) : (
        !isFetching && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <ToDo />
            <h2 className="text-2xl font-semibold tracking-tight">
              No layers found
            </h2>
            <p className="text-sm text-muted-foreground">
              No layers data were found.
            </p>
          </div>
        )
      )}
    </div>
  );
}

InspectLeftPanel.displayName = 'InspectLeftPanel';

export default InspectLeftPanel;
