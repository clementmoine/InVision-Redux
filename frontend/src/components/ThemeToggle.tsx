import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks';
import { useMemo } from 'react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentTheme = useMemo(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      return systemTheme;
    }

    return theme;
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="text-foreground">
          <Sun
            className={cn(
              'h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all',
              {
                '-rotate-90 scale-0': currentTheme === 'dark',
              },
            )}
          />
          <Moon
            className={cn(
              'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all',
              {
                'rotate-0 scale-100': currentTheme === 'dark',
              },
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
ThemeToggle.displayName = 'ThemeToggle';

export { ThemeToggle };
