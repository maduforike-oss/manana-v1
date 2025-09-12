import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { devAutoSignIn } from '../lib/devAuth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Auto sign-in for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      devAutoSignIn();
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </>
  );
}