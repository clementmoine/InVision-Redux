import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { defaultValues } from '@/views/Projects';
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

import { GetProjectsParams, getProjects } from '@/api/projects';

function ProjectsTab() {
  const [searchParams] = useSearchParams();
  const { favorites } = useFavorites();

  // Define the params to get favorites (pagination, type, tags ...)
  const params = useMemo<GetProjectsParams>(() => {
    const params: GetProjectsParams = {};

    searchParams.entries();
    const search = searchParams.get('search') ?? defaultValues.search;
    const type = searchParams.get('type') ?? defaultValues.type;
    const tag = searchParams.get('tag') ?? defaultValues.tag;
    const page = searchParams.get('page') ?? defaultValues.page;
    const limit = searchParams.get('limit') ?? defaultValues.limit;
    const sort = searchParams.get('sort') ?? defaultValues.sort;

    // When favorite tab is open we pass the ids to fetch
    if (type === 'favorites') {
      // Filter on favorites by their ids
      params.project_ids = Array.from(favorites);
    } else if (type !== defaultValues.type) {
      params.type = type == 'prototypes' ? 'prototype' : 'board';
    }

    // Filter on prototypes with a tag
    if (tag !== defaultValues.tag) {
      params.tag = Number(tag);
    }

    if (page !== defaultValues.page) {
      params.page = Number(page);
    }

    if (limit !== defaultValues.limit) {
      params.limit = Number(limit);
    }

    if (search !== defaultValues.search) {
      params.search = search;
    }

    if (
      sort &&
      sort !== defaultValues.sort &&
      ['title', 'update'].includes(sort)
    ) {
      params.sort = sort as 'title' | 'update';
    }

    return params;
  }, [searchParams, favorites]);

  const { data: response } = useQuery({
    queryKey: ['projects', params],
    queryFn: getProjects,
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
