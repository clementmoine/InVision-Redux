import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import defaultValues from '@/constants/defaultValues';
import { Project } from '@/components/Project';
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

function ProjectsTab() {
  const [searchParams] = useSearchParams();
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

          params[key] = value == 'prototypes' ? 'prototype' : 'board';
        } else if (key === 'sort') {
          if (value === 'update' || value === 'title') {
            params[key] = value;
          }
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }, [searchParams, favorites]);

  const { data: response } = useQuery({
    queryKey: ['projects', params],
    queryFn: fetchProjects,
    placeholderData: keepPreviousData,
  });

  // Generate the pages to display (pagination component)
  const pages = useMemo<Array<string | number>>(() => {
    if (!response || !response.total || !response.limit || !response.page)
      return [];

    const totalPages = Math.ceil(response.total / response.limit);
    const currentPage = response.page;
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '&hellip;') {
        pages.push('&hellip;');
      }
    }

    return pages;
  }, [response]);

  return (
    <div className="flex flex-col gap-4">
      {/* Projects */}
      <div
        dir="ltr"
        data-orientation="horizontal"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      >
        {response?.data?.map(project => (
          <Project key={project['id']} project={project} />
        ))}
      </div>

      {/* Pagination */}
      {pages.length > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={index}>
                {page === '&hellip;' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink href={`?page=${page}`}>{page}</PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export { ProjectsTab };
