import { useEffect } from 'react';
import { To, useNavigate } from 'react-router-dom';

interface RedirectProps {
  to: To;
}

function Redirect(props: RedirectProps) {
  const { to } = props;

  const navigate = useNavigate();

  useEffect(() => {
    navigate(to);
  });

  return null;
}
Redirect.displayName = 'Redirect';

export { Redirect };
