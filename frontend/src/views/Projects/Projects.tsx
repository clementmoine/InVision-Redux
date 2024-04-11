import { z } from 'zod';
import debounce from 'debounce';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownAZ, Search, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useSearchParams } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProjectsTab } from '@/views/Projects';

import defaultValues from '@/constants/defaultValues';

import { fetchTags } from '@/api/tags';

import { useFavorites } from '@/hooks/useFavorites';

const formSchema = z.object({
  search: z.string(),
});

function Projects() {
  const { favorites } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: searchParams.get('search') ?? defaultValues.projects.search,
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

  // Revert to all tab if no favorites
  useEffect(() => {
    if (favorites.size === 0) {
      setSearchParams(searchParams => {
        if (searchParams.get('type') === 'favorites') {
          searchParams.delete('type');
        }

        return searchParams;
      });
    }
  }, [favorites.size, setSearchParams]);

  return (
    <div className="flex flex-col flex-1 p-8 pt-6 gap-4 bg-muted/40">
      {/* Header */}
      <div className="flex gap-4 justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
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
                      placeholder="Search projects..."
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

      {/* Tabs */}
      <Tabs
        value={searchParams.get('type') ?? defaultValues.projects.type}
        defaultValue={defaultValues.projects.type}
        className="flex flex-col gap-4"
        onValueChange={value => {
          setSearchParams(searchParams => {
            if (value == 'all') {
              searchParams.delete('type');
            } else {
              searchParams.set('type', value);
            }

            return searchParams;
          });
        }}
      >
        {/* Toolbar (tabs, search, filters) */}
        <div className="flex justify-between gap-4">
          {/* Left Part */}
          <div className="flex gap-4 items-center">
            {/* Tabs list */}
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="prototypes">Prototypes</TabsTrigger>
              <TabsTrigger value="boards">Boards</TabsTrigger>
              {favorites.size > 0 && (
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Right part (sort, filters) */}
          <div className="flex gap-4 items-center">
            {/* Sort */}
            <Select
              value={searchParams.get('sort') ?? defaultValues.projects.sort}
              onValueChange={value => {
                setSearchParams(searchParams => {
                  if (value == defaultValues.projects.sort) {
                    searchParams.delete('sort', undefined);
                  } else {
                    searchParams.set('sort', value);
                  }

                  return searchParams;
                });
              }}
            >
              <div className="flex relative ml-auto flex-1 md:grow-0 items-center">
                <ArrowDownAZ className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <SelectTrigger className="w-[180px] bg-background pl-8 text-left">
                  <SelectValue placeholder="Select a sort value" />
                </SelectTrigger>
              </div>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort</SelectLabel>
                  <SelectItem value="update">Recently updated</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Tag filter */}
            <Select
              value={searchParams.get('tag') ?? defaultValues.projects.tag}
              onValueChange={value => {
                setSearchParams(searchParams => {
                  if (value == defaultValues.projects.tag) {
                    searchParams.delete('tag', undefined);
                  } else {
                    searchParams.set('tag', value);
                  }

                  return searchParams;
                });
              }}
            >
              <div className="flex relative ml-auto flex-1 md:grow-0 items-center">
                <Tag className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <SelectTrigger className="w-[180px] bg-background pl-8 text-left">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
              </div>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tags</SelectLabel>
                  <SelectItem value="all">All</SelectItem>

                  {tags?.map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs (all, favorites ...) */}
        {/* Note: the key is mandatory to properly render the tab depending on the type (key value doesn't matter but they should be different) */}
        <TabsContent value="all">
          <ProjectsTab key="all" />
        </TabsContent>
        <TabsContent value="prototypes">
          <ProjectsTab key="prototypes" />
        </TabsContent>
        <TabsContent value="boards">
          <ProjectsTab key="boards" />
        </TabsContent>
        <TabsContent value="favorites">
          <ProjectsTab key="favorites" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
Projects.displayName = 'Projects';

export { Projects };
