import { useNavigate, useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Code2, Eye, Share, Workflow } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { getProjectScreen } from '@/api/projects';

function Screen() {
  const navigate = useNavigate();
  const params = useParams();

  const { data: screen } = useQuery({
    queryKey: ['projects', Number(params.projectId), Number(params.screenId)],
    queryFn: getProjectScreen,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex h-full w-full bg-muted/40 items-center justify-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Screen {screen?.name}
        </h1>
      </div>

      <footer className="flex h-16 items-center border-t bg-background p-3">
        <nav className="flex flex-1 gap-1 justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg bg-muted"
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

          <div>
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

          <Button
            variant="default"
            className="rounded-lg gap-2"
            aria-label="Back"
          >
            <Share className="size-5" />
            Share
          </Button>
        </nav>
      </footer>
    </div>
  );
}
Screen.displayName = 'Screen';

export { Screen };
