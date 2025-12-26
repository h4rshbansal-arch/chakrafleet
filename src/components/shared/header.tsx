"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { UserNav } from "./user-nav";
import { LanguageToggle } from "./language-toggle";

export function Header() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="relative flex-1">
        <h1 className="font-headline text-2xl font-bold">{t('sidebar.dashboard')}</h1>
      </div>
      <LanguageToggle />
      <UserNav />
    </header>
  );
}
