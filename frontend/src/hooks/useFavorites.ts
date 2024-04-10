import { FavoritesProviderContext } from '@/context/favorites-provider';
import { useContext } from 'react';

export const useFavorites = () => {
  const context = useContext(FavoritesProviderContext);

  if (context === undefined)
    throw new Error('useFavorites must be used within a FavoritesProvider');

  return context;
};
