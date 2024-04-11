import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/context/theme-provider';
import { FavoritesProvider } from '@/context/favorites-provider';
import { CollapsedGroupsProvider } from '@/context/collapsed-groups-provider';

import { TooltipProvider } from '@/components/ui/tooltip';

import App from './App.tsx';

import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <FavoritesProvider>
          <CollapsedGroupsProvider>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </BrowserRouter>
          </CollapsedGroupsProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
