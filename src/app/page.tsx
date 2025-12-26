'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This component acts as an entry point to the application.
// It redirects all traffic from the root path to the login page.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  // Render a minimal loading state to avoid flashes of content.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
