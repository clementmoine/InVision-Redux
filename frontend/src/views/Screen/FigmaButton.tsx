import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { FigmaIcon } from '@/components/icons/figma';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

import { getProjectFigmaUrl, updateProjectFigmaUrl } from '@/api/projects';

import style from './FigmaButton.module.scss';

interface FigmaButtonProps {}

const formSchema = z.object({
  url: z
    .string()
    .url({ message: 'URL must be a valid URL.' })
    .refine(val => /figma\.com\/(design|proto)\//.test(val), {
      message: 'URL must come from figma.com',
    })
    .optional()
    .or(z.literal('')),
});

const FigmaButton: React.FC<FigmaButtonProps> = () => {
  const params = useParams();
  const isMutating = useIsMutating();
  const isFetching = useIsFetching();
  const [isOpen, setIsOpen] = useState(false);

  const [isShiftPressed, setIsShiftPressed] = useState(false); // State to track Shift key

  const isValidUrl = useCallback((url: string | undefined): boolean => {
    if (!url) return false;

    const result = formSchema.safeParse({ url });

    return result.success;
  }, []);

  const projectId = useMemo(() => {
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
    queryKey: ['figma', Number(projectId)],
    queryFn: getProjectFigmaUrl,
  });

  const figmaUrl: string = useMemo(
    () =>
      _figmaUrl && isValidUrl(_figmaUrl)
        ? _figmaUrl.replace('/design/', '/proto/').trim()
        : '',
    [_figmaUrl],
  );

  const isConfigured = useMemo(
    () => figmaUrl.length > 0 && !isShiftPressed,
    [figmaUrl, isShiftPressed],
  );

  const { mutate } = useMutation({
    mutationFn: updateProjectFigmaUrl,
    onError: error => {
      form.setError('url', {
        type: 'manual',
        message: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['figma', Number(projectId)],
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      url: figmaUrl,
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const { url } = values;

      mutate(
        { id: Number(projectId), url },
        {
          onSuccess: () => {
            setIsOpen(false); // Close the modal on success
          },
        },
      );
    },
    [mutate, projectId],
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
            tooltip={
              isConfigured
                ? 'Open the prototype in Figma'
                : 'Configure the Figma prototype url'
            }
            tooltipContentProps={{
              side: 'bottom',
              sideOffset: 5,
            }}
            variant="secondary"
            id={isConfigured ? 'open-in-figma' : 'configure-figma'}
            className={cn('relative rounded-lg gap-2', {
              [style['gradient-button']]: isConfigured,
            })}
            aria-label={isConfigured ? 'Open in Figma' : 'Configure Figma'}
          >
            <FigmaIcon className="h-4 w-4" />
            {isConfigured ? 'Open in Figma' : 'Configure Figma'}
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
                    <FormLabel hidden>Figma project URL</FormLabel>
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
                <Button type="submit" className="gap-2">
                  {(!!isFetching || !!isMutating) && (
                    <Spinner className="h-4 w-4 pointer-events-none" />
                  )}
                  Save
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FigmaButton;
