import { useQuery } from '@tanstack/react-query';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/components/project';

import { getProjects } from '@/api/projects';
import { getTags } from '@/api/tags';

function Projects() {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: getTags });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>

        <div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tags</SelectLabel>
                {tags?.map(tag => (
                  <SelectItem value={tag.id.toString()}>{tag.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div dir="ltr" data-orientation="horizontal" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {projects?.map(project => (
            <Project key={project['id']} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
Projects.displayName = 'Projects';

export { Projects };
