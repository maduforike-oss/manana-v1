import React from 'react';

// We use react-router-dom if available; otherwise fall back to window.history.
let useNavigateHook: undefined | (() => (to: number | string) => void);
let useLocationHook: undefined | (() => { key?: string });

try {
  // This will succeed only if react-router-dom is installed and Router is mounted
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rrd = require('react-router-dom') as typeof import('react-router-dom');
  useNavigateHook = rrd.useNavigate as any;
  useLocationHook = rrd.useLocation as any;
} catch {
  // no-op: we'll fall back to window
}

type Props = {
  fallback?: string; // where to go if no history
  className?: string;
  children?: React.ReactNode;
};

export default function BackButton({ fallback = '/', className, children }: Props) {
  const useNavigate = useNavigateHook;
  const navigate = useNavigate ? useNavigate() : null;

  const goBack = React.useCallback(() => {
    // If there is browser history, go back
    if (typeof window !== 'undefined' && window.history.length > 1) {
      if (navigate) {
        navigate(-1 as unknown as number);
      } else {
        window.history.back();
      }
      return;
    }
    // Otherwise, go to fallback
    if (navigate) {
      navigate(fallback);
    } else if (typeof window !== 'undefined') {
      window.location.href = fallback;
    }
  }, [navigate, fallback]);

  return (
    <button
      type="button"
      onClick={goBack}
      className={className ?? 'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5'}
      aria-label="Go back"
    >
      {children ?? '← Back'}
    </button>
  );
}