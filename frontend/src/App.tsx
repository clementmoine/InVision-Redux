import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Routes, Route, Outlet, Link, useNavigate } from 'react-router-dom';

import Test from '@/views/Test';
import { Screen } from '@/views/Screen';
import { Project } from '@/views/Project';
import { Projects } from '@/views/Projects';
import { NotFound } from '@/views/NotFound';

import { About } from '@/components/About';
import { Toaster } from '@/components/ui/sonner';
// import { Redirect } from '@/components/Redirect';
import ConfettiComponent from '@/components/Confetti';
import { ThemeToggle } from '@/components/ThemeToggle';

import InVision from '@/assets/invision.svg?react';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    // Check if the current path is the root path
    const isRootPath = window.location.pathname === '/';

    if (hash) {
      // Regex matching /projects/prototypes/<ProjectID>
      const projectMatch = hash.match(
        /^#\/projects\/prototypes\/(?<projectId>\d+)/,
      );

      // Regex matching /console/<ProjectID>/<ScreenID>/<mode>
      const consoleMatch = hash.match(
        /^#\/console\/(?<projectId>\d+)\/(?<screenId>\d+)\/?(?<mode>preview|inspect)?/,
      );

      if (hash === '#/projects') {
        navigate('/projects');
      } else if (projectMatch?.groups?.projectId) {
        const { projectId } = projectMatch.groups;
        navigate(`/projects/${projectId}`);
      } else if (
        consoleMatch?.groups?.projectId &&
        consoleMatch?.groups?.screenId
      ) {
        const { projectId, screenId, mode } = consoleMatch.groups;

        if (mode != null) {
          navigate(`/projects/${projectId}/${screenId}/${mode}`);
        } else {
          navigate(`/projects/${projectId}/${screenId}`);
        }
      }
    } else if (isRootPath) {
      // Redirect to /projects if on the root path
      navigate('/projects');
    }
  }, [navigate]);

  return (
    <Routes>
      {/* Screens without layout */}
      <Route path="/test" element={<Test />} />
      <Route
        path="/projects/:projectId/:screenId/:mode?"
        element={<Screen />}
      />

      {/* Screens with layout */}
      <Route path="/" element={<Layout />}>
        {/* Home => Redirect to projects */}
        {/* <Route path="/" element={<Redirect to="/projects" />} /> */}

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
  const [animated, setAnimated] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setAnimated(true), 2000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAnimated(false);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <header className="dark z-30 top-0 left-0 w-full flex h-16 border-b bg-background px-4 flex-shrink-0">
        <div className="flex justify-between w-full gap-4 items-center max-w-7xl mx-auto">
          <nav>
            <Link
              to="/"
              className="flex items-center gap-2 h-16 font-semibold flex-shrink-0 text-foreground"
            >
              <InVision className="h-6 w-auto" title="InVision" />
              <h1>
                <span className="sr-only">InVision </span>
                {animated ? (
                  <ConfettiComponent id="redux" tooltip={false}>
                    <TypeAnimation
                      preRenderFirstString={true}
                      sequence={[
                        'Redux',
                        250,
                        'Red UX',
                        1200,
                        'Red ducks 🦆',
                        1000,
                        500,
                        'POP!',
                        () => {
                          document.getElementById('redux')?.click();
                        },
                        200,
                        'POP! POP!',
                        () => {
                          document.getElementById('redux')?.click();
                        },
                        200,
                        'POP! POP! POP!',
                        () => {
                          document.getElementById('redux')?.click();
                        },
                        200,
                        'Redux',
                        () => {
                          setAnimated(false);
                        },
                      ]}
                      wrapper="span"
                      cursor={true}
                    />
                  </ConfettiComponent>
                ) : (
                  <span
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    Redux
                  </span>
                )}
              </h1>
            </Link>
          </nav>

          <div className="flex gap-4 ml-auto">
            <ThemeToggle />
            <About />
          </div>
        </div>
      </header>

      <div className="h-full px-4 py-6 overflow-auto bg-muted/40">
        <Toaster />
        <Outlet />
      </div>
    </div>
  );
}
