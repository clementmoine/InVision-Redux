import { z } from 'zod';
import debounce from 'debounce';
import { useCallback, useMemo } from 'react';
import { Search, Share, StarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useParams, Link } from 'react-router-dom';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScreenCard } from '@/components/ScreenCard';
import {
  AccordionTrigger,
  AccordionItem,
  Accordion,
  AccordionContent,
} from '@/components/ui/accordion';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';

import { getProject } from '@/api/projects';

import defaultValues from '@/constants/defaultValues';

import { useFavorites } from '@/hooks/useFavorites';
import { useCollapsedGroups } from '@/hooks/useCollapsedGroups';

import EmptyState from '@/assets/illustrations/empty-state.svg?react';

const formSchema = z.object({
  search: z.string(),
});

function Project() {
  const params = useParams();
  const { favorites, setFavorites } = useFavorites();
  const { collapsedGroups, setCollapsedGroups } = useCollapsedGroups();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: project,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: [
      'projects',
      Number(params.id),
      {
        search: searchParams.get('search') ?? defaultValues.project.search,
      },
    ],
    queryFn: getProject,
    placeholderData: keepPreviousData,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParams.get('search') ?? defaultValues.project.search,
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const { search } = values;

      setSearchParams(searchParams => {
        if (search == '') {
          searchParams.delete('search');
        } else {
          searchParams.set('search', search);
        }

        return searchParams;
      });
    },
    [setSearchParams],
  );

  const onInput = useCallback(
    debounce((value: string) => {
      onSubmit({ search: value });
    }, 300),
    [onSubmit],
  );

  const expandedGroups = useMemo(() => {
    return project?.screens.groups.reduce((acc, group) => {
      if (!collapsedGroups.has(group.dividerID)) {
        acc.push(group.dividerID.toString());
      }

      return acc;
    }, [] as string[]);
  }, [collapsedGroups, project]);

  return (
    <div className="flex flex-col flex-1 p-8 pt-6 gap-4 bg-muted/40">
      {project != null ? (
        <>
          {/* Header */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex gap-4">
                <h2 className="text-3xl font-bold tracking-tight self-start">
                  {project.data.name}
                </h2>

                <Toggle
                  aria-label="Add to favorites"
                  pressed={favorites.has(project.id)}
                  onPressedChange={pressed => {
                    setFavorites(favorites => {
                      if (pressed) {
                        favorites.add(project.id);
                      } else {
                        favorites.delete(project.id);
                      }

                      return favorites;
                    });
                  }}
                >
                  <StarIcon
                    fill={
                      favorites.has(project.id) ? 'currentColor' : 'transparent'
                    }
                    className="h-4 w-4"
                  />
                </Toggle>
              </div>

              <div className="flex h-auto top-2 left-2 gap-1">
                {project.data.tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/projects?tag=${tag.id}`}
                    className="flex"
                  >
                    <Badge className="w-fit h-fit bg-muted-foreground border-popover">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <Button
              variant="default"
              className="rounded-lg gap-2"
              aria-label="Back"
            >
              <Share className="size-5" />
              Share
            </Button>
          </div>

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
                        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="search"
                          placeholder="Search screens..."
                          className="rounded-lg bg-background pl-8 w-[320px]"
                          onInput={e => onInput(e.currentTarget.value)}
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

          {/* Screens */}
          <div className="flex flex-col gap-4">
            <Accordion
              type="multiple"
              onValueChange={expandedGroups => {
                setCollapsedGroups(collapsedGroups => {
                  project.screens.groups.forEach(group => {
                    if (!expandedGroups.includes(group.dividerID.toString())) {
                      collapsedGroups.add(group.dividerID);
                    } else {
                      collapsedGroups.delete(group.dividerID);
                    }
                  });

                  return collapsedGroups;
                });
              }}
              value={expandedGroups}
            >
              {project.screens.groups
                .sort((a, b) => a.sort - b.sort)
                .map((group, index) => {
                  const screens = project.screens.screens.filter(
                    screen => screen.screenGroupId === group.dividerID,
                  );

                  const isLast = project.screens.groups.length === index + 1;

                  return (
                    screens.length > 0 && (
                      <AccordionItem
                        key={group.dividerID}
                        value={group.dividerID.toString()}
                        className={isLast ? 'border-b-0' : 'border-b'}
                      >
                        <AccordionTrigger className="group hover:no-underline text-center">
                          <div className="flex gap-2 flex-1">
                            <span className="group-hover:underline">
                              {group.label}
                            </span>

                            {collapsedGroups.has(group.dividerID) ? (
                              <Badge className="pointer-events-none bg-destructive">
                                {screens.length} screens not shown
                              </Badge>
                            ) : (
                              <Badge className="bg-muted-foreground pointer-events-none">
                                {screens.length}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>

                        <AccordionContent
                          dir="ltr"
                          data-orientation="horizontal"
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
                        >
                          {screens.map(screen => (
                            <ScreenCard key={screen.id} screen={screen} />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  );
                })}
            </Accordion>
          </div>
        </>
      ) : (
        !isFetching &&
        !isPending && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <EmptyState />
            <h2 className="text-2xl font-semibold tracking-tight">
              There is nothing here?
            </h2>
            <p className="text-sm text-muted-foreground">
              Huh? I thought I left that here... strange.
            </p>
            <Button className="mt-4" onClick={() => refetch()}>
              Give it another shot
            </Button>
          </div>
        )
      )}
    </div>
  );
}

Project.displayName = 'Project';

export { Project };
