import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/context/theme-provider';
import { FavoritesProvider } from '@/context/favorites-provider';
import { CollapsedGroupsProvider } from '@/context/collapsed-groups-provider';

import { TooltipProvider } from '@/components/ui/tooltip';
import Onboarding from '@/components/Onboarding';

import App from './App.tsx';

import './index.css';
import defaultValues from './constants/defaultValues.ts';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <Helmet>
      <title>{defaultValues.title}</title>
    </Helmet>

    <React.StrictMode>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <FavoritesProvider>
            <CollapsedGroupsProvider>
              <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                  <Onboarding />
                  <App />
                </QueryClientProvider>
              </BrowserRouter>
            </CollapsedGroupsProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </TooltipProvider>
    </React.StrictMode>
  </HelmetProvider>,
);
