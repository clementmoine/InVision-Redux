import { Coffee, Github, Info, PenToolIcon } from 'lucide-react';

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
import ConfettiComponent from '@/components/Confetti';

import Logo from '@/assets/logo.svg?react';

function About() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-foreground">
          <Info className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">About</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-4">
            <ConfettiComponent id="logo">
              <Logo
                id="logo"
                className="h-8 w-8 rounded-md align-center mb-2"
              />
            </ConfettiComponent>

            <span>Invision Redux {pkg.version}</span>
          </AlertDialogTitle>

          <AlertDialogDescription className="flex flex-col gap-4">
            <p>
              <b>InVision Redux</b> is an open-source project created as a
              response to the shutdown of the original InVision application on
              December 31st, 2024. This project is <i>not affiliated</i> with
              InVision. Note that <b>none of the source code</b> is from
              InVision; only the projects have been extracted from the original
              app.
            </p>

            <p>
              This tool provides a better backup solution for design teams,
              overcoming the limitations of InVision's official export options.
            </p>

            <p>
              <b>Disclaimer:</b> InVision Redux is for internal use only,
              allowing teams to back up and access their own data. Users are
              responsible for complying with InVision's terms of service. Using
              this tool involves risks, such as potential account suspension. By
              using InVision Redux, users accept these risks and agree that the
              developers are not liable for any consequences.
            </p>

            <a
              href="https://github.com/clementmoine/InVision-Redux"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              aria-label="Visit the Invision Redux project on GitHub"
            >
              <Github className="h-4 w-4" />
              Invision Redux on Github
            </a>
            <a
              href="https://www.linkedin.com/in/clemmoine/"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              aria-label="Developed by Clément Moine"
            >
              <Coffee className="h-4 w-4" />
              Developed by Clément Moine
            </a>
            <a
              href="https://www.linkedin.com/in/yasmin-sagaya-rekha-957181173"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              aria-label="Illustrations from Yasmin Sagaya Rekha"
            >
              <PenToolIcon className="h-4 w-4" />
              Illustrations from Yasmin Sagaya Rekha
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
