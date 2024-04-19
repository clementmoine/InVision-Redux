import { Coffee, Github, Info } from 'lucide-react';

import pkg from '../../package.json';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import Logo from '@/assets/logo.svg?react';

function About() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">About</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-4">
            <Logo className="h-8 w-8 rounded-md align-center mb-2" />
            <span>Invision Redux {pkg.version}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-4">
            <p>
              This app is a replica of the InVision application, which is
              permanently shutting down on December 31st, 2024.
            </p>
            <p>
              I want to clarify that I have no affiliation with InVision; this
              project is open source, so any contributions are welcome.
            </p>

            <a
              href="https://github.com/clementmoine/InVision-Redux"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <Github className="h-4 w-4" />
              Invision Redux on Github
            </a>
            <a
              href="https://github.com/clementmoine"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <Coffee className="h-4 w-4" />
              Meet the dev @clement.moine
            </a>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
About.displayName = 'About';

export { About };
