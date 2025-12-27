"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/shared/header";
import { DashboardProvider } from "@/contexts/dashboard-context";
import { Footer } from "@/components/shared/footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth state is still loading, don't do anything.
    if (isUserLoading) return;

    // If loading is finished and user is not authenticated, redirect to login.
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isUserLoading, router]);

  // While checking auth or if not authenticated, show a loading screen.
  // This prevents child components from rendering and attempting to fetch data.
  if (isUserLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Render the app layout only for authenticated users.
  return (
      <DashboardProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Header />
            <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8">
              {children}
            </main>
            <Footer />
        </div>
      </DashboardProvider>
  );
}
