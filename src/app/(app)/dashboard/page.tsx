// src/app/(app)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardRedirectPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'Admin':
          router.replace('/admin/dashboard');
          break;
        case 'Supervisor':
          router.replace('/supervisor/dashboard');
          break;
        case 'Driver':
          router.replace('/driver/dashboard');
          break;
        default:
          // Fallback or handle unexpected role
          router.replace('/login');
          break;
      }
    }
  }, [user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="ml-4">Redirecting to your dashboard...</p>
    </div>
  );
}
