import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Code2, Eye, Share, Workflow } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import ScreenPreview from '@/components/ScreenPreview';

function Screen() {
  const params = useParams();
  const navigate = useNavigate();

  const [zoomLevel] = useState<number>(0.5);

  return (
    <div id="screen" className="flex h-screen w-full flex-col overflow-hidden">
      {/* Screen */}
      <div
        className="flex h-full w-full justify-center overflow-hidden p-0"
        style={{
          backgroundColor: 'rgb(var(--screen-background-color))', // Defined after the fetching of the screen
        }}
      >
        {params.projectId && params.screenId && (
          <ScreenPreview
            zoomLevel={zoomLevel}
            screenId={Number(params.screenId)}
            projectId={Number(params.projectId)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="flex h-16 items-center border-t bg-background p-3 z-[100]">
        <nav className="flex flex-1 gap-1 justify-between">
          <div className="flex flex-1 items-center gap-4 justify-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Back"
                  onClick={() => navigate(`/projects/${params.projectId}`)}
                >
                  <ArrowLeft className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Back
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Preview Mode"
                >
                  <Eye className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Preview Mode <kbd>(P)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Flow Mode"
                >
                  <Workflow className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Flow Mode <kbd>(F)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Inspect"
                >
                  <Code2 className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                Inspect <kbd>(I)</kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="History Mode"
                >
                  <Clock className="size-5" />
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={5}>
                History Mode <kbd>(M)</kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-1 items-center gap-4 justify-end">
            <Button
              variant="default"
              className="rounded-lg gap-2"
              aria-label="Back"
            >
              <Share className="size-5" />
              Share
            </Button>
          </div>
        </nav>
      </footer>
    </div>
  );
}
Screen.displayName = 'Screen';

export { Screen };
