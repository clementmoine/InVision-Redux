import { z } from 'zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { SearchIcon } from '@/components/icons/search';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScreenCard } from '@/components/ScreenCard';

import { ArchivedScreenDetails, ScreenDetails } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  search: z.string(),
});

interface DistanceDisplayProps {
  handleClose: () => void;
  data?: ScreenDetails | ArchivedScreenDetails;
}

const ThumbnailTray: React.FC<DistanceDisplayProps> = props => {
  const { data, handleClose } = props;

  const params = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: search ?? '',
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    const { search } = values;
    setSearch(search.trim() || undefined); // Update state with trimmed search term
  }, []);

  // Memoized filtered and grouped screens
  const filteredDividers = useMemo(() => {
    if (!data || !('activeScreens' in data) || !('dividers' in data)) {
      return [];
    }

    return data.dividers
      .sort((a, b) => a.sort - b.sort)
      .map(divider => {
        const screens = data.activeScreens
          .filter(
            screen =>
              screen.screenGroupId === divider.dividerID &&
              (!search ||
                screen.name.toLowerCase().includes(search.toLowerCase())),
          )
          .sort((a, b) => a.sort - b.sort);

        // Return null if there are no screens for this divider
        return screens.length > 0 ? { ...divider, screens } : null;
      })
      .filter(divider => divider !== null); // Remove null dividers
  }, [data, search]);

  // Reference to the container
  const containerRef = useRef<HTMLOListElement>(null);

  // Effect to scroll to the active screen
  useEffect(() => {
    if (containerRef.current && params.screenId) {
      // Find the active screen element
      const activeScreenElement = containerRef.current.querySelector(
        `.screen-active`,
      ) as HTMLLIElement;

      if (activeScreenElement) {
        // Scroll the container to the active screen
        activeScreenElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Scroll to the nearest edge of the viewport
          inline: 'center', // Center the element horizontally
        });
      }
    }
  }, [params.screenId, filteredDividers]);

  return (
    <div className="dark flex flex-col fixed bottom-16 w-full gap-3 h-fit py-3 z-50 overflow-hidden bg-background flex-shrink-0">
      <div className="flex justify-between px-3">
        {/* Search Input */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex relative ml-auto flex-1 md:grow-0 items-center">
                      <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="search"
                        placeholder={`Search in ${
                          (data != null &&
                            'activeScreens' in data &&
                            data.activeScreens.length) ??
                          0
                        } screens...`}
                        className="text-foreground rounded-lg pl-8 max-w-[320px]"
                        onInput={form.handleSubmit(onSubmit)}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Close Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg flex-shrink-0 text-foreground"
              aria-label="Close the tray"
              onClick={handleClose}
            >
              <X className="size-5" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="top" sideOffset={5}>
            Close the tray
          </TooltipContent>
        </Tooltip>
      </div>

      <ol
        ref={containerRef}
        className="flex flex-row px-3 overflow-x-auto gap-5 items-stretch"
      >
        {filteredDividers.map(divider => {
          if (divider != null) {
            return (
              <li
                key={divider.dividerID}
                className="flex flex-col shrink-0 gap-2 pb-2"
              >
                <h3 className="text-foreground text-sm uppercase">
                  {divider.label}
                </h3>

                <ol className="flex flex-row gap-3 h-full">
                  {divider.screens.map(screen => (
                    <li
                      key={screen.id}
                      className={cn('flex shrink-0 w-48', {
                        'screen-active': screen.id === Number(params.screenId),
                      })}
                    >
                      <ScreenCard
                        screen={screen}
                        mode="inspect"
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();

                          navigate(
                            `/projects/${screen.projectID}/${screen.id}/${params.mode}`,
                            { replace: true },
                          );
                        }}
                        className={cn('w-full', {
                          'outline-primary outline outline-4':
                            screen.id === Number(params.screenId),
                        })}
                      />
                    </li>
                  ))}
                </ol>
              </li>
            );
          }
        })}
      </ol>
    </div>
  );
};

ThumbnailTray.displayName = 'ThumbnailTray';

export { ThumbnailTray };
