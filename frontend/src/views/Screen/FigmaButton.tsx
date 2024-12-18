import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FigmaIcon } from '@/components/icons/figma';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectFigmaUrl, updateProjectFigmaUrl } from '@/api/projects';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FigmaButtonProps {}

const formSchema = z.object({
  url: z
    .string()
    .url({ message: 'URL must be a valid URL.' })
    .refine(val => val.includes('figma.com'), {
      message: 'URL must come from figma.com',
    })
    .optional()
    .or(z.literal('')),
});

const FigmaButton: React.FC<FigmaButtonProps> = () => {
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const [isShiftPressed, setIsShiftPressed] = useState(false); // State to track Shift key

  const isValidUrl = useCallback((url: string | undefined): boolean => {
    if (!url) return false;

    const result = formSchema.safeParse({ url });

    return result.success;
  }, []);

  const getProjectId = useMemo(() => {
    if ('projectId' in params) {
      return params.projectId;
    } else if ('id' in params) {
      return params.id;
    } else {
      return undefined;
    }
  }, [params]);

  const queryClient = useQueryClient();

  const { data: _figmaUrl } = useQuery({
    queryKey: ['figma', Number(getProjectId)],
    queryFn: getProjectFigmaUrl,
  });

  const figmaUrl: string = useMemo(
    () => (_figmaUrl && isValidUrl(_figmaUrl) ? _figmaUrl.trim() : ''),
    [_figmaUrl],
  );

  const isConfigured = useMemo(
    () => figmaUrl.length > 0 && !isShiftPressed,
    [figmaUrl, isShiftPressed],
  );

  const { mutate } = useMutation({
    mutationFn: updateProjectFigmaUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['figma', Number(getProjectId)],
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: figmaUrl,
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const { url } = values;

      mutate(
        { id: Number(getProjectId), url },
        {
          onSuccess: () => {
            setIsOpen(false); // Close the modal on success
          },
        },
      );
    },
    [mutate, getProjectId],
  );

  // Handle shift key press and release
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  }, []);

  const handleOpen = useCallback(
    (open: boolean) => {
      // Close asked
      if (!open) {
        setIsOpen(false);
        return;
      }

      if (isConfigured) {
        window.open(figmaUrl, '_blank', 'noopener,noreferrer,nofollow'); // Navigate to the URL
      } else {
        setIsOpen(true); // Open form to (re)configure figma url
      }
    },
    [figmaUrl, isShiftPressed],
  );

  // Listen for Shift key press
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <>
      {/* Button */}
      <AlertDialog open={isOpen} onOpenChange={handleOpen} defaultOpen={false}>
        <AlertDialogTrigger asChild>
          <Button
            variant="secondary"
            className="relative rounded-lg gap-2"
            id={isConfigured ? 'open-in-figma' : 'configure-figma'}
            aria-label={isConfigured ? 'Open in Figma' : 'Configure Figma'}
          >
            <FigmaIcon className="h-4 w-4" />
            {isConfigured ? 'Open in Figma' : 'Configure Figma'}
            {isConfigured && (
              <div className="absolute -inset-[2px] rounded-[calc(var(--radius)+2px)] bg-[linear-gradient(to_right,#FF7262,#A259FF,#1ABCFE,#0ACF83)] -z-10"></div>
            )}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="flex gap-4">
                  Figma migration
                </AlertDialogTitle>

                <AlertDialogDescription className="flex flex-col gap-4">
                  Enter your Figma project URL to let viewers access the
                  migrated prototype and be informed of the migration.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex relative ml-auto flex-1 md:grow-0 items-center">
                        <FigmaIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />

                        <Input
                          type="url"
                          placeholder="Enter prototype url"
                          className="rounded-lg bg-background pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit">Save</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FigmaButton;
