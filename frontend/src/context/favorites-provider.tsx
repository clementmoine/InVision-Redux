import { Project } from '@/types';
import { Dispatch, SetStateAction, createContext, useState } from 'react';

export type FavoritesProps = {
  children: React.ReactNode;
  storageKey?: string;
};

export type Favorites = Set<Project['id']>;

export type FavoritesState = {
  favorites: Favorites;
  setFavorites: Dispatch<SetStateAction<Favorites>>;
};

const initialState: FavoritesState = {
  favorites: new Set<Project['id']>(),
  setFavorites: () => null,
};

export const FavoritesProviderContext =
  createContext<FavoritesState>(initialState);

export function FavoritesProvider({
  children,
  storageKey = 'favorites',
  ...props
}: FavoritesProps) {
  const [favorites, setFavorites] = useState<Favorites>(() => {
    const storedFavorites = JSON.parse(
      localStorage.getItem(storageKey) || '[]',
    ) as Array<Project['id']>;

    return new Set<Project['id']>(storedFavorites);
  });

  const value = {
    favorites,
    setFavorites: (
      newFavorites: Favorites | ((prevState: Favorites) => Favorites),
    ) => {
      setFavorites(prevFavorites => {
        const updatedFavorites = new Set(
          typeof newFavorites === 'function'
            ? newFavorites(prevFavorites)
            : newFavorites,
        );

        localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(updatedFavorites)),
        );

        return updatedFavorites;
      });
    },
  };

  return (
    <FavoritesProviderContext.Provider {...props} value={value}>
      {children}
    </FavoritesProviderContext.Provider>
  );
}
