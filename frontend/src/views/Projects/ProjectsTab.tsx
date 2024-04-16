import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import defaultValues from '@/constants/defaultValues';
import { ProjectCard } from '@/components/ProjectCard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useFavorites } from '@/hooks/useFavorites';

import { FetchProjectsParams, fetchProjects } from '@/api/projects';

import EmptyState from '@/assets/illustrations/empty-state.svg?react';

import { Button } from '@/components/ui/button';

function ProjectsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useFavorites();

  // Define the params to get favorites (pagination, type, tags ...)
  const params = useMemo<FetchProjectsParams>(() => {
    const params: FetchProjectsParams = {};

    (
      Array.from(searchParams.entries()) as Array<
        [keyof Omit<FetchProjectsParams, 'project_ids'>, string]
      >
    ).forEach(([key, value]) => {
      if (
        value &&
        (value ?? defaultValues.projects[key]) !== defaultValues.projects[key]
      ) {
        if (key === 'tag' || key === 'page' || key === 'limit') {
          params[key] = Number(value);
        } else if (key === 'type') {
          if (value === 'favorites') {
            params.project_ids = Array.from(favorites);

            return;
          }

          params[key] =
            value == 'prototypes'
              ? 'prototype'
              : value === 'boards'
                ? 'board'
                : 'archived';
        } else if (key === 'sort') {
          if (value === 'updatedAt' || value === 'name') {
            params[key] = value;
          }
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }, [searchParams, favorites]);

  const {
    data: projects,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['projects', params],
    queryFn: fetchProjects,
    placeholderData: keepPreviousData,
  });

  const pages = useMemo<Array<string | number>>(() => {
    if (!projects || !projects.total || !projects.limit || !projects.page)
      return [];

    const totalPages = Math.ceil(projects.total / projects.limit);
    const currentPage = projects.page;
    const maxButtonsToShow = 9; // Maximum number of buttons to show
    const pages = [];

    if (totalPages <= maxButtonsToShow) {
      // If the total number of pages is less than or equal to the maximum number of buttons to show,
      // display all pages without ellipses
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate the indices of the pages to display around the current page
      let start;
      let end;

      // If the current page is close enough to the beginning
      if (currentPage <= Math.ceil(maxButtonsToShow / 2)) {
        start = 1;
        end = maxButtonsToShow - 2; // -2 for ellipses and last page
      } else if (currentPage >= totalPages - Math.floor(maxButtonsToShow / 2)) {
        // If the current page is close enough to the end
        start = totalPages - maxButtonsToShow + 3; // +3 for first page and ellipses
        end = totalPages;
      } else {
        // Otherwise, place the current page in the middle
        start = currentPage - Math.floor(maxButtonsToShow / 2) + 2; // +1 for first page
        end = currentPage + Math.floor(maxButtonsToShow / 2) - 2; // -1 for last page
      }

      // Add pages and ellipses
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (start > 2) {
        pages.unshift('&hellip;');
      }
      if (end < totalPages - 1) {
        pages.push('&hellip;');
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
      if (!pages.includes(1)) {
        pages.unshift(1);
      }
    }

    return pages;
  }, [projects]);

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Projects */}
      {projects && projects.data.length > 0 ? (
        <div
          dir="ltr"
          data-orientation="horizontal"
          className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {projects.data.map(project => (
            <ProjectCard key={project['id']} project={project} />
          ))}
        </div>
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

      {/* Pagination */}
      {pages.length > 1 && projects && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={e => {
                  e.preventDefault();
                  setSearchParams(searchParams => {
                    searchParams.set('page', projects.previousPage.toString());
                    return searchParams;
                  });
                }}
                href={`/projects?page=${projects?.previousPage}`}
              />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={index}>
                {page === '&hellip;' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={Number(projects.page) === page}
                    onClick={e => {
                      e.preventDefault();
                      setSearchParams(searchParams => {
                        searchParams.set('page', page.toString());
                        return searchParams;
                      });
                    }}
                    href={`/projects?page=${page}`}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={e => {
                  e.preventDefault();
                  setSearchParams(searchParams => {
                    searchParams.set('page', projects.nextPage.toString());
                    return searchParams;
                  });
                }}
                href={`/projects?page=${projects.nextPage}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export { ProjectsTab };
