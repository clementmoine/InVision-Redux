import {
  ClipboardCopy,
  Component,
  Folder,
  FolderOpen,
  Gem,
  Spline,
  Type,
} from 'lucide-react';
import { useCallback, MouseEvent, SetStateAction, Dispatch } from 'react';

import { cn } from '@/lib/utils';
import { rgbToHex } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Layer, Color, Gradient, ScreenInspect } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface InspectRightPanelProps {
  data?: ScreenInspect;
  selectedLayer?: Layer;
  expandedGroupIds: Layer['id'][];
  setSelectedLayer: Dispatch<SetStateAction<Layer | undefined>>;
  setExpandedGroupIds: Dispatch<SetStateAction<Layer['id'][]>>;
}

function InspectRightPanel(props: InspectRightPanelProps) {
  const { selectedLayer, setSelectedLayer, expandedGroupIds } = props;

  const renderInfo = useCallback((label?: string, value?: string) => {
    return (
      !!value && (
        <li>
          <a
            role="button"
            className="flex gap-2 hover:bg-muted rounded-lg px-4 py-2"
          >
            {!!label && (
              <span className="text-muted-foreground text-nowrap">
                {label}:
              </span>
            )}
            <span className="text-nowrap first-letter:uppercase">{value}</span>
          </a>
        </li>
      )
    );
  }, []);

  const renderGradient = useCallback((gradient: Gradient) => {
    const gradientStops = gradient.stops
      .map(
        stop =>
          `rgba(${stop.color[0]}, ${stop.color[1]}, ${stop.color[2]}, ${stop.color[3]})`,
      )
      .join(', ');

    return (
      <li>
        <a
          role="button"
          className="flex flex-row gap-2 text-sm items-stretch hover:bg-muted rounded-lg px-4 py-2"
        >
          {/* Checker background for transparent colors 🏁 */}
          <span
            className="flex w-5 h-auto shrink-0 rounded-sm outline relative overflow-hidden text-neutral-200"
            style={{
              backgroundImage:
                'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor 100%), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor 100%)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0, 5px 5px',
            }}
          >
            {/* Preview of the color */}
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${gradientStops})`,
              }}
            />
          </span>

          {/* Values */}
          <ol className="flex flex-col overflow-hidden gap-3">
            {gradient.stops.map(stop => (
              <li className="uppercase text-nowrap">
                <span className="text-nowrap">
                  {rgbToHex(stop.color[0], stop.color[1], stop.color[2])}
                </span>
                <span className="text-nowrap"> @ </span>
                <span className="text-nowrap">
                  {(stop.location * 100).toFixed(2).replace(/\.?0+$/, '')}%
                </span>
              </li>
            ))}
          </ol>
        </a>
      </li>
    );
  }, []);

  const renderColor = useCallback(
    (color: Color | undefined, index?: number | string) => {
      if (!color?.length) return;

      const [r, g, b, alpha = 1, label = undefined] = color;

      return (
        <li key={index}>
          <a
            role="button"
            className="flex flex-row gap-2 text-sm items-center hover:bg-muted rounded-lg px-4 py-2"
          >
            {/* Checker background for transparent colors 🏁 */}
            <span
              className="flex w-5 h-5 shrink-0 rounded-sm outline relative overflow-hidden text-neutral-200"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor 100%), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor 100%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 5px 5px',
              }}
            >
              {/* Preview of the color */}
              <span
                className="absolute inset-0"
                style={{
                  backgroundColor: `rgba(${r}, ${g}, ${b}, ${Number(alpha)
                    .toFixed(2)
                    .replace(/\.?0+$/, '')})`,
                }}
              />
            </span>

            {/* Value */}
            <span className="flex flex-col overflow-hidden">
              {/* Label */}
              {label && (
                <span className="lowercase first-letter:uppercase text-ellipsis whitespace-nowrap overflow-hidden">
                  {label}
                </span>
              )}

              {/* Value */}
              {alpha === 1 ? (
                // Hex
                <span className="uppercase">{rgbToHex(r, g, b)}</span>
              ) : (
                // RGBA
                <span>{`rgba(${Number(r)}, ${Number(g)}, ${Number(b)}, ${Number(
                  alpha,
                )
                  .toFixed(2)
                  .replace(/\.?0+$/, '')})`}</span>
              )}
            </span>
          </a>
        </li>
      );
    },
    [],
  );

  const renderLayer = useCallback(
    (layer: Layer, level = 0) => {
      const isSelected = selectedLayer ? selectedLayer.id === layer.id : false;

      if (layer.type === 'group' && layer.layers) {
        const isExpanded = expandedGroupIds.includes(layer.id);

        return (
          <AccordionItem key={layer.id} value={layer.id} className="border-b-0">
            <AccordionTrigger
              className={cn(
                'p-2 overflow-hidden rounded-lg transition-all !no-underline gap-3',
                {
                  'text-muted-foreground hover:bg-muted hover:text-neutral-500':
                    !isSelected,
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
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-all',
            {
              'text-muted-foreground hover:bg-stone-50 hover:text-neutral-500':
                !isSelected,
              'bg-primary-foreground text-primary': isSelected,
            },
          )}
          style={{ paddingLeft: level ? `${level * 1.5}rem` : undefined }}
        >
          {layer.type === 'text' ? (
            <Type className="h-4 w-4 shrink-0" />
          ) : (
            <Spline className="h-4 w-4 shrink-0" />
          )}

          <span className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
            {layer.name}
          </span>
        </a>
      );
    },
    [expandedGroupIds, selectedLayer, setSelectedLayer],
  );

  return (
    <div className="flex flex-col bg-background p-0 overflow-auto h-full">
      {selectedLayer && (
        <>
          {/* Layer name */}
          <div className="flex flex-col gap-3 p-4 border-b">
            <div className="flex flex-row items-center gap-3">
              {/* Layer icon */}
              {selectedLayer.symbol ? (
                <Component className="h-4 w-4 shrink-0 text-primary" />
              ) : selectedLayer.type === 'group' ? (
                <Folder className="h-4 w-4 shrink-0 text-primary" />
              ) : selectedLayer.type === 'text' ? (
                <Type className="h-4 w-4 shrink-0" />
              ) : (
                <Spline className="h-4 w-4 shrink-0" />
              )}

              <h2 className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
                {selectedLayer.name}
              </h2>
            </div>

            {selectedLayer.type === 'text' && (
              <div className="flex">
                <Input
                  value={selectedLayer.text}
                  readOnly
                  className="rounded-r-none border-r-0"
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-lg rounded-l-none flex-shrink-0 ml-auto"
                      aria-label="Copy to clipboard"
                    >
                      <ClipboardCopy className="size-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="top" sideOffset={5}>
                    Copy to clipboard
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Layer details */}
          <div className="flex-1 overflow-auto mb-20">
            {/* Symbol details */}
            {(!!selectedLayer.symbol || !!selectedLayer.sharedStyle) && (
              <div className="flex flex-col gap-4 py-4 px-2 border-b">
                <div className="flex items-center gap-2 px-4 ">
                  <Gem className="w-4 h-4 shrink-0 text-yellow-500" />
                  <p className="text-sm">
                    {selectedLayer.symbolMaster
                      ? 'Symbol'
                      : selectedLayer.sharedStyle?.type === 'textStyle'
                        ? 'Text Style'
                        : 'Layer Style'}
                  </p>
                </div>

                <a
                  role="button"
                  className="flex flex-col gap-1 hover:bg-muted rounded-lg px-4 py-2"
                >
                  <span className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
                    {
                      (selectedLayer.symbolMaster || selectedLayer.sharedStyle)
                        ?.name
                    }
                  </span>
                  <span className="text-sm text-neutral-500 text-ellipsis whitespace-nowrap overflow-hidden">
                    {(selectedLayer.symbolMaster || selectedLayer.sharedStyle)
                      ?.sourceLibraryName ?? 'Document'}
                  </span>
                </a>
              </div>
            )}

            {/* Layer details */}
            <div className="flex flex-col gap-4 py-4">
              {/* Position */}
              <ul
                id="position"
                className="flex flex-col px-2 text-sm text-popover-foreground empty:hidden"
              >
                {renderInfo('X', `${selectedLayer.x}px`)}
                {renderInfo('Y', `${selectedLayer.y}px`)}
                {renderInfo('Width', `${selectedLayer.width}px`)}
                {renderInfo('Height', `${selectedLayer.height}px`)}
              </ul>

              {/* Text */}
              {selectedLayer.type === 'text' && (
                <ul
                  id="text"
                  className="flex flex-col px-2 text-sm text-popover-foreground empty:hidden"
                >
                  {renderInfo(
                    'Font',
                    `${selectedLayer.typeface?.typeface} ${selectedLayer.typeface?.weight}`,
                  )}

                  {renderInfo('Size', `${selectedLayer.typeface?.fontSize}px`)}

                  {renderInfo(
                    'Line height',
                    `${selectedLayer.typeface?.lineHeight}px`,
                  )}

                  {renderInfo(
                    'Letter spacing',
                    `${selectedLayer.typeface?.characterSpacing}px`,
                  )}

                  {renderInfo('Align', selectedLayer.typeface?.alignment)}

                  {renderColor(selectedLayer.typeface?.fontColor)}
                </ul>
              )}

              {/* Text attributes (parts) */}
              {selectedLayer.type === 'text' &&
                (selectedLayer.textAttributes?.length ?? 0) > 1 &&
                selectedLayer.textAttributes?.map((textAttributes, index) => (
                  <ul
                    key={`text_attributes_${index}`}
                    id="text_attributes"
                    className="flex flex-col px-2 text-sm text-popover-foreground empty:hidden"
                  >
                    {renderInfo(
                      undefined,
                      `"${selectedLayer.text?.substring(
                        textAttributes.location,
                        textAttributes.length,
                      )}"`,
                    )}

                    {(textAttributes.attributes.typeface !==
                      selectedLayer.typeface?.typeface ||
                      textAttributes.attributes.weight !==
                        selectedLayer.typeface?.weight) &&
                      renderInfo(
                        'Font',
                        `${textAttributes.attributes.typeface} ${textAttributes.attributes.weight}`,
                      )}

                    {textAttributes.attributes.fontSize !==
                      selectedLayer.typeface?.fontSize &&
                      renderInfo(
                        'Size',
                        `${textAttributes.attributes.fontSize}px`,
                      )}

                    {textAttributes.attributes.lineHeight !==
                      selectedLayer.typeface?.lineHeight &&
                      renderInfo(
                        'Line height',
                        `${textAttributes.attributes.lineHeight}px`,
                      )}

                    {textAttributes.attributes.characterSpacing !==
                      selectedLayer.typeface?.characterSpacing &&
                      renderInfo(
                        'Letter spacing',
                        `${textAttributes.attributes.characterSpacing}px`,
                      )}

                    {textAttributes.attributes.alignment !==
                      selectedLayer.typeface?.alignment &&
                      renderInfo('Align', textAttributes.attributes.alignment)}

                    {textAttributes.attributes.fontColor !=
                      selectedLayer.typeface?.fontColor &&
                      renderColor(textAttributes.attributes.fontColor)}
                  </ul>
                ))}

              {/* Border radius */}
              {!!selectedLayer.borderRadius?.length && (
                <ul
                  id="radius"
                  className="flex flex-col px-2 text-sm text-popover-foreground empty:hidden"
                >
                  {renderInfo(
                    'Radius',
                    selectedLayer.borderRadius.every(
                      borderRadius =>
                        borderRadius === selectedLayer.borderRadius?.[0],
                    )
                      ? selectedLayer.borderRadius[0]
                        ? `${selectedLayer.borderRadius[0]}px`
                        : undefined
                      : selectedLayer.borderRadius
                          .map(borderRadius => `${borderRadius}px`)
                          .join(', '),
                  )}
                </ul>
              )}

              {/* Fill attributes */}
              {!!selectedLayer.fillColor?.length && (
                <ul
                  id="fill"
                  className="flex flex-col px-2 text-sm text-popover-foreground empty:hidden"
                >
                  {selectedLayer.fillColor.map((fill, index) => (
                    <li key={index}>
                      <ul>
                        {renderInfo('Fill', 'Solid')}

                        {renderColor(fill, index)}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              {/* Borders */}
              {!!selectedLayer.borders?.length && (
                <ul
                  id="borders"
                  className="flex flex-col px-2 text-sm text-popover-foreground"
                >
                  {selectedLayer.borders.map((border, index) => (
                    <li key={index}>
                      <ul>
                        {renderInfo('Border', border.type)}

                        {renderColor(border.color)}

                        {renderInfo('Position', border.placement)}

                        {renderInfo('Width', `${border.thickness}px`)}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              {/* Gradients */}
              {!!selectedLayer.gradients?.length && (
                <ul
                  id="gradients"
                  className="flex flex-col px-2 text-sm text-popover-foreground"
                >
                  {selectedLayer.gradients.map((gradient, index) => (
                    <>
                      <li key={index}>
                        <ul>
                          {renderInfo(
                            'Fill',
                            gradient.type === 'linear'
                              ? `Linear gradient, ${(Math.atan2(gradient.to.y - gradient.from.y, gradient.to.x - gradient.from.x) * (180 / Math.PI) + 450) % 360}°`
                              : `Radial gradient, circle`,
                          )}

                          {renderGradient(gradient)}
                        </ul>
                      </li>
                    </>
                  ))}
                </ul>
              )}

              {/* Shadows */}
              {(!!selectedLayer.shadows?.length ||
                !!selectedLayer.innerShadows?.length) && (
                <ul
                  id="shadows"
                  className="flex flex-col px-2 text-sm text-popover-foreground"
                >
                  {selectedLayer.shadows?.map((shadow, index) => (
                    <li key={`shadows_${index}`}>
                      <ul>
                        {renderInfo('Shadow', 'Outer')}

                        {renderColor(shadow.color)}

                        {renderInfo('Blur', `${shadow.blur}px`)}

                        {renderInfo('Spread', `${shadow.spread}px`)}

                        {renderInfo('Offset', `${shadow.x}px, ${shadow.y}px`)}
                      </ul>
                    </li>
                  ))}

                  {/* Inner Shadows */}
                  {selectedLayer.innerShadows?.map((shadow, index) => (
                    <li key={`innerShadows_${index}`}>
                      <ul>
                        {renderInfo('Shadow', 'Inner')}

                        {renderColor(shadow.color)}

                        {renderInfo('Blur', `${shadow.blur}px`)}

                        {renderInfo('Spread', `${shadow.spread}px`)}

                        {renderInfo('Offset', `${shadow.x}px, ${shadow.y}px`)}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

InspectRightPanel.displayName = 'InspectRightPanel';

export default InspectRightPanel;
