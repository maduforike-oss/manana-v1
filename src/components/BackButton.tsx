'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter();
  
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="inline-flex items-center gap-2"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}