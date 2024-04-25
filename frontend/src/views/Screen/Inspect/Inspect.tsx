import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ArchivedScreenDetails, Project, Screen } from '@/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Folder, Type } from 'lucide-react';

interface ScreenInspectProps {
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
  allScreens?: Screen[];
}

function ScreenInspect(props: ScreenInspectProps) {
  const { screenId, projectId, zoomLevel, screen, allScreens } = props;

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ResizablePanelGroup
      id="screen-inspect"
      direction="horizontal"
      data-screen-id={screen.id.toString()}
    >
      {/* Layers */}
      <ResizablePanel minSize={10} className="bg-background">
        <Accordion type="multiple">
          <AccordionItem value="group-1" className="border-b-0">
            <AccordionTrigger className="p-2">
              <div className="flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary">
                <Folder className="h-4 w-4" />
                Group 1
              </div>
            </AccordionTrigger>

            <AccordionContent className="pl-5 pb-0">
              <AccordionItem value="group-2" className="border-b-0">
                <AccordionTrigger className="p-2">
                  <div className="flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary">
                    <Folder className="h-4 w-4" />
                    Group 2
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-5 pb-0">
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-lg p-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Type className="h-4 w-4" />
                    Text 3
                  </a>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="group-3" className="border-b-0">
                <AccordionTrigger className="p-2">
                  <div className="flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary">
                    <Folder className="h-4 w-4" />
                    Group 3
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-5 pb-0">
                  <a
                    href="#"
                    className="flex items-center gap-3 rounded-lg p-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Type className="h-4 w-4" />
                    Text 2
                  </a>
                </AccordionContent>
              </AccordionItem>

              <a
                href="#"
                className="flex items-center gap-3 rounded-lg p-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Type className="h-4 w-4" />
                Text 1
              </a>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Screen with annotations */}
      <ResizablePanel
        minSize={10}
        defaultSize={60}
        className="flex relative p-16 bg-muted/40 !overflow-auto"
      >
        {/* Image */}
        <img
          decoding="sync"
          src={`/api/static/${screen.imageUrl}`}
          className="object-contain mx-auto"
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
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code and values */}
      <ResizablePanel minSize={10} className="bg-background">
        Code and values
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
ScreenInspect.displayName = 'ScreenInspect';

export default ScreenInspect;
