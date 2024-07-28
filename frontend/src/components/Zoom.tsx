import { useCallback, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface ZoomProps {
  onChange?: (level: number) => void;
  className?: string | undefined;
  initialValue?: number;
  min?: number;
  max?: number;
}

const Zoom: React.FC<ZoomProps> = (props: ZoomProps) => {
  const { onChange, max = 8, min = 0.2, className, initialValue = 1 } = props;

  const [zoomLevel, setZoomLevel] = useState(initialValue);

  const handleReset = useCallback(() => {
    setZoomLevel(initialValue);
    onChange?.(initialValue);
  }, [initialValue, onChange]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => {
      let step = 0.1; // Default step size

      if (prevZoom >= 0.5) {
        step = prevZoom < 1 ? 0.25 : 0.5; // Adjust step size between 50 and 100
      }

      const newZoom = Math.min(prevZoom + step, max);

      onChange?.(newZoom);

      return newZoom;
    });
  }, [setZoomLevel, onChange, max]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => {
      let step = 0.1; // Default step size

      if (prevZoom > 0.5) {
        step = prevZoom <= 1 ? 0.25 : 0.5; // Adjust step size between 50 and 100
      }

      const newZoom = Math.max(prevZoom - step, min);

      onChange?.(newZoom);

      return newZoom;
    });
  }, [setZoomLevel, onChange, min]);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center flex-nowrap border rounded-md p-1 bg-background',
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= min}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom Out</TooltipContent>
      </Tooltip>

      {/* Zoom level as percent */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="disabled:opacity-100 px-2 w-[50px]"
            onClick={handleReset}
            disabled={zoomLevel === initialValue}
          >
            {`${Math.round(zoomLevel * 100)}%`}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Reset to {Math.round(initialValue * 100)}%
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= max}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom In</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Zoom;
