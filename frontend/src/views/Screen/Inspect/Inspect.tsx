import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getScreenInspect } from '@/api/screens';
import { ArchivedScreenDetails, Project, Screen, Layer } from '@/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import InspectLeftPanel from './LeftPanel';
import InspectRightPanel from './RightPanel';
import InspectMiddlePanel from './MiddlePanel';
import useLocalStorage from '@/hooks/useLocalStorage';

interface InspectProps {
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
  allScreens?: Screen[];
}

function Inspect(props: InspectProps) {
  const { zoomLevel, screen } = props;

  const storage = useLocalStorage('inspect_panels');

  const [hoveredLayer, setHoveredLayer] = useState<Layer>();
  const [selectedLayer, setSelectedLayer] = useState<Layer>();
  const [expandedGroupIds, setExpandedGroupIds] = useState<Layer['id'][]>([]);

  const params = useParams();

  const { data, isFetching } = useQuery({
    queryKey: [
      'projects',
      Number(params.projectId),
      Number(params.screenId),
      'inspect',
    ],
    queryFn: getScreenInspect,
    placeholderData: keepPreviousData,
  });

  return (
    <ResizablePanelGroup
      id="screen-inspect"
      direction="horizontal"
      className="overflow-hidden"
      data-screen-id={screen.id.toString()}
      storage={storage}
      autoSaveId="inspect_panels"
    >
      {/* Layers */}
      <ResizablePanel id="left-panel" minSize={20} maxSize={60}>
        <InspectLeftPanel
          data={data}
          screen={screen}
          isFetching={isFetching}
          hoveredLayer={hoveredLayer}
          setHoveredLayer={setHoveredLayer}
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          expandedGroupIds={expandedGroupIds}
          setExpandedGroupIds={setExpandedGroupIds}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Screen with annotations */}
      <ResizablePanel id="middle-panel" minSize={0} defaultSize={75}>
        <InspectMiddlePanel
          data={data}
          screen={screen}
          zoomLevel={zoomLevel}
          isFetching={isFetching}
          hoveredLayer={hoveredLayer}
          setHoveredLayer={setHoveredLayer}
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          expandedGroupIds={expandedGroupIds}
          setExpandedGroupIds={setExpandedGroupIds}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code and values */}
      <ResizablePanel id="right-panel" minSize={20} maxSize={60}>
        <InspectRightPanel
          data={data}
          screen={screen}
          isFetching={isFetching}
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          expandedGroupIds={expandedGroupIds}
          setExpandedGroupIds={setExpandedGroupIds}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
Inspect.displayName = 'Inspect';

export default Inspect;
