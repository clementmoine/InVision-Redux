import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import NotFoundImage from '@/assets/illustrations/not-found.svg?react';
function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
      <NotFoundImage />
      <h2 className="text-2xl font-semibold tracking-tight">
        Nothing to see here!
      </h2>
      <p className="text-sm text-muted-foreground">
        Lost your way, hooman? Time to paws and rethink! 🐾
      </p>
      <Button onClick={() => navigate('/')}>Go to the home page</Button>
    </div>
  );
}
NotFound.displayName = 'NotFound';

export { NotFound };
