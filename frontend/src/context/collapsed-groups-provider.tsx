import { ScreenGroup } from '@/types';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

export type CollapsedGroupsProps = {
  children: React.ReactNode;
  storageKey?: string;
};

export type CollapsedGroups = Set<ScreenGroup['dividerID']>;

export type CollapsedGroupsState = {
  collapsedGroups: CollapsedGroups;
  setCollapsedGroups: Dispatch<SetStateAction<CollapsedGroups>>;
};

const initialState: CollapsedGroupsState = {
  collapsedGroups: new Set<ScreenGroup['dividerID']>(),
  setCollapsedGroups: () => null,
};

export const CollapsedGroupsProviderContext =
  createContext<CollapsedGroupsState>(initialState);

export function CollapsedGroupsProvider({
  children,
  storageKey = 'collapsed-groups',
  ...props
}: CollapsedGroupsProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<CollapsedGroups>(
    () => {
      const storedCollapsedGroups = JSON.parse(
        localStorage.getItem(storageKey) || '[]',
      ) as Array<ScreenGroup['dividerID']>;

      return new Set<ScreenGroup['dividerID']>(storedCollapsedGroups);
    },
  );

  const value = {
    collapsedGroups,
    setCollapsedGroups: (
      newCollapsedGroups:
        | CollapsedGroups
        | ((prevState: CollapsedGroups) => CollapsedGroups),
    ) => {
      setCollapsedGroups(prevCollapsedGroups => {
        const updatedCollapsedGroups = new Set(
          typeof newCollapsedGroups === 'function'
            ? newCollapsedGroups(prevCollapsedGroups)
            : newCollapsedGroups,
        );

        localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(updatedCollapsedGroups)),
        );

        return updatedCollapsedGroups;
      });
    },
  };

  return (
    <CollapsedGroupsProviderContext.Provider {...props} value={value}>
      {children}
    </CollapsedGroupsProviderContext.Provider>
  );
}
