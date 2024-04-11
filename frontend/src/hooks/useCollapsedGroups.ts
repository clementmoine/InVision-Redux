import { CollapsedGroupsProviderContext } from '@/context/collapsed-groups-provider';
import { useContext } from 'react';

export const useCollapsedGroups = () => {
  const context = useContext(CollapsedGroupsProviderContext);

  if (context === undefined)
    throw new Error(
      'useCollapsedGroups must be used within a CollapsedGroupsProvider',
    );

  return context;
};
