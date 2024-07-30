import { z } from 'zod';
import debounce from 'debounce';
import { useCallback, useMemo } from 'react';
import { Search, Share, StarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet-async';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { copyToClipboard } from '@/utils';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  search: z.string(),
});

function Project() {
  const params = useParams();
  const { toast } = useToast();
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

  const isArchivedProject = useMemo(
    () => !!project?.data?.isArchived,
    [project],
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
    <div className="flex flex-col flex-1 gap-4 max-w-7xl mx-auto">
      {project != null ? (
        <>
          {/* Helmet title */}
          <Helmet>
            <title>{project.data.name} - InVision</title>
          </Helmet>

          {/* Header */}
          <div className="flex flex-wrap justify-between gap-2">
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

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  className="rounded-lg gap-2"
                  aria-label="Share"
                  onClick={() => copyToClipboard(window.location.href, toast)}
                >
                  <Share className="size-5" />
                  Share
                </Button>
              </TooltipTrigger>

              <TooltipContent side="left" sideOffset={5}>
                Copy to clipboard
              </TooltipContent>
            </Tooltip>
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
                          placeholder={`Search in ${
                            project?.screens?.[
                              searchParams.get('type') === 'archived'
                                ? 'archivedscreens'
                                : 'screens'
                            ]?.length ?? 0
                          } screens...`}
                          className="rounded-lg bg-background pl-8 max-w-[320px]"
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

          <Tabs
            value={searchParams.get('type') ?? defaultValues.projects.type}
            defaultValue={defaultValues.projects.type}
            className="flex flex-col gap-4 h-full w-full"
            onValueChange={value => {
              setSearchParams(searchParams => {
                if (value == 'all') {
                  searchParams.delete('type');
                } else {
                  searchParams.set('type', value);
                }

                searchParams.delete('page');

                return searchParams;
              });
            }}
          >
            {/* Toolbar (tabs, search, filters) */}
            {project.screens.archivedScreensCount > 0 && (
              <div className="flex justify-between gap-4">
                {/* Left Part */}
                <div className="flex gap-4 items-center">
                  {/* Tabs list */}
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                </div>
              </div>
            )}

            {/* Screens */}
            <Accordion
              type="multiple"
              className="mt-4"
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
                .map(group => {
                  const type =
                    searchParams.get('type') === 'archived'
                      ? 'archivedscreens'
                      : 'screens';
                  const screens = project.screens?.[type]?.filter(
                    screen => screen.screenGroupId === group.dividerID,
                  );

                  return (
                    screens?.length > 0 && (
                      <AccordionItem
                        key={group.dividerID}
                        value={group.dividerID.toString()}
                        className="border-b-0"
                      >
                        {group.label != '' && (
                          <AccordionTrigger className="group hover:no-underline text-center gap-4">
                            <div className="h-0 border-b flex-1 border-current" />
                            <div className="flex gap-2 justify-center">
                              <span className="group-hover:underline uppercase text-sm">
                                {group.label}
                              </span>

                              {collapsedGroups.has(group.dividerID) ? (
                                <Badge
                                  variant="destructive"
                                  className="pointer-events-none"
                                >
                                  {screens.length} screens not shown
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="pointer-events-none bg-background border-foreground"
                                >
                                  {screens.length}
                                </Badge>
                              )}
                            </div>
                            <div className="h-0 border-b flex-1 border-current" />
                          </AccordionTrigger>
                        )}

                        <AccordionContent
                          dir="ltr"
                          data-orientation="horizontal"
                          className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        >
                          {screens.map(screen => (
                            <ScreenCard
                              key={screen.id}
                              screen={screen}
                              disabled={isArchivedProject}
                            />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  );
                })}
            </Accordion>
          </Tabs>
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
