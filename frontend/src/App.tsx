import { Routes, Route, Outlet, Link } from 'react-router-dom';

import { NotFound } from '@/views/NotFound';
import { Projects } from '@/views/Projects';
import { Project } from '@/views/Project';

import { Redirect } from '@/components/Redirect';
import { ThemeToggle } from '@/components/ThemeToggle';

import InVision from '@/assets/invision.svg?react';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home => Redirect to projects */}
        <Route path="/" element={<Redirect to="/projects" />} />

        {/* Screens */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Project />} />

        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky z-30 top-0 flex h-16 items-center gap-4 border-b bg-background px-4">
        <nav>
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold flex-shrink-0"
          >
            <InVision className="h-6 w-6 text-primary" title="InVision" />
            InVision
          </Link>
        </nav>

        <div className="gap-4 ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <Outlet />
    </div>
  );
}
