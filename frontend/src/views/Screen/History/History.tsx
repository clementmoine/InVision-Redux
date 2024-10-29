import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';

import { getScreenHistory } from '@/api/screens';

import { ArchivedScreenDetails, Project, Screen, ScreenVersion } from '@/types';

import { getInitials, isSystemAvatar } from '@/utils';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import useLocalStorage from '@/hooks/useLocalStorage';

import style from './History.module.scss';
import dayjs from 'dayjs';

interface HistoryProps {
  screenId: Screen['id'];
  projectId: Project['id'];
  zoomLevel: number;
  screen: Screen | ArchivedScreenDetails['screen'];
}

function History(props: HistoryProps) {
  const { screen, zoomLevel } = props;

  const storage = useLocalStorage('history_panels');

  const [_selectedVersion, setSelectedVersion] = useState<ScreenVersion | null>(
    null,
  );

  const params = useParams();

  const { data } = useQuery({
    queryKey: [
      'projects',
      Number(params.projectId),
      Number(params.screenId),
      'history',
    ],
    queryFn: getScreenHistory,
    placeholderData: keepPreviousData,
  });

  const sortedVersions = useMemo(
    () => data?.versions.sort((a, b) => b.createdAt - a.createdAt),
    [data],
  );

  const selectedVersion = useMemo(
    () => _selectedVersion || sortedVersions?.[0],
    [_selectedVersion, sortedVersions],
  );

  const isCurrentVersion = useCallback(
    (version?: ScreenVersion) =>
      'imageVersion' in screen &&
      version &&
      version.version === screen.imageVersion &&
      version.imageUrl === screen.imageUrl,
    [screen],
  );

  // Reset the current version when screen changed
  useMemo(() => {
    setSelectedVersion(null);
  }, [screen.id]);

  return (
    <ResizablePanelGroup
      id="screen-versions"
      direction="horizontal"
      className="overflow-hidden"
      data-screen-id={screen.id.toString()}
      storage={storage}
      autoSaveId="versions_panels"
    >
      {/* Layers */}
      <ResizablePanel
        id="left-panel"
        minSize={20}
        maxSize={60}
        className="flex flex-col gap-4 bg-background"
      >
        <div className="flex mt-4 mx-4 h-10 items-center shrink-0">
          <h2 className="text-sm ">Versions ({data?.versions?.length ?? 0})</h2>
        </div>

        <ol className="flex flex-col gap-2 overflow-auto px-4 pb-4">
          {data?.versions.map(version => {
            const isSelected = version.version === selectedVersion?.version;

            return (
              <li key={version.screenversionid}>
                <a
                  href="#"
                  role="button"
                  onClick={() => setSelectedVersion(version)}
                  className={cn(
                    'flex flex-col gap-2 rounded-md p-2 transition-all h-full',
                    {
                      'text-muted-foreground hover:bg-stone-50 hover:text-neutral-500':
                        !isSelected,
                      'bg-primary-foreground text-primary': isSelected,
                    },
                  )}
                >
                  <span className="flex gap-2 justify-between">
                    <span className="flex gap-2 items-center">
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage
                          src={
                            isSystemAvatar(version.avatarID)
                              ? undefined
                              : `/api/static/${version.avatarUrl}`
                          }
                          alt={version.userName}
                        />

                        <AvatarFallback className="text-muted-foreground text-[12px] align-middle text-center h-full aspect-square w-auto p-0">
                          {getInitials(version.userName)}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-sm">{version.userName}</p>
                    </span>

                    {isCurrentVersion(version) && (
                      <span
                        className="flex bg-current p-1 overflow-hidden w-fit rounded-sm"
                        style={{ fontSize: 10 }}
                      >
                        <span className="text-stone-50">Latest version</span>
                      </span>
                    )}
                  </span>

                  <span className="text-sm text-ellipsis whitespace-nowrap overflow-hidden">
                    {dayjs(version.createdAt).format('L LT')}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Screen with annotations */}
      <ResizablePanel
        id="middle-panel"
        minSize={50}
        defaultSize={75}
        data-version={selectedVersion?.version}
        className="flex"
      >
        <div
          className={cn(
            'flex w-full items-start !overflow-auto text-neutral-200 bg-slate-50 p-16',
            style['checkerboard'],
          )}
        >
          {/* Image */}
          <img
            key={selectedVersion?.version}
            decoding="sync"
            src={`/api/static/${selectedVersion?.imageUrl}`}
            className={cn('h-auto mx-auto', {
              'h-auto': !isCurrentVersion(selectedVersion),
            })}
            style={{
              width: screen.width * zoomLevel,
              minWidth: screen.width * zoomLevel,
              maxWidth: screen.width * zoomLevel,
              height: isCurrentVersion(selectedVersion)
                ? screen.height * zoomLevel
                : undefined,
              minHeight: isCurrentVersion(selectedVersion)
                ? screen.height * zoomLevel
                : undefined,
              maxHeight: isCurrentVersion(selectedVersion)
                ? screen.height * zoomLevel
                : undefined,
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
History.displayName = 'History';

export default History;
