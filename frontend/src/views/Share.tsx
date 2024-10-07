import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import EmptyState from '@/assets/illustrations/empty-state.svg?react';

import { getProjectByShareId } from '@/api/shares';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';

const Share: React.FC = () => {
  const { shareId, screenId } = useParams<{
    shareId: string;
    screenId: string;
  }>();
  const navigate = useNavigate();

  // Use react-query to fetch the project by share ID
  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ['projectByShareId', shareId!],
    queryFn: getProjectByShareId,
  });

  // Handle loading and error states
  if (isFetching) {
    return (
      <div className="absolute bg-background/50 flex inset-0 h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
        <Spinner />
      </div>
    );
  }

  // Error
  if (error || data?.project_id == null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
        <EmptyState />

        <h2 className="text-2xl font-semibold tracking-tight">
          There is nothing here?
        </h2>

        <p className="text-sm text-muted-foreground">
          Huh? I thought I left that here... strange.
        </p>

        <Button className="mt-4" onClick={() => refetch()}>
          Give it another shot
        </Button>
      </div>
    );
  }

  // Navigate to the project page when the project ID is fetched
  if (data?.project_id) {
    if (screenId) {
      navigate(`/projects/${data.project_id}/${screenId}`);
      return;
    }

    navigate(`/projects/${data.project_id}`);
  }

  return null; // Render nothing, since navigation will occur after fetching
};

export default Share;
