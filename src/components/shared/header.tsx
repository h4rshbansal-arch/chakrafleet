"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { UserNav } from "./user-nav";
import { LanguageToggle } from "./language-toggle";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <AppSidebar isSheet={true} />
        </SheetContent>
      </Sheet>

      <div className="relative flex-1 md:grow-0">
        <h1 className="font-headline text-lg font-bold md:text-2xl">{t('sidebar.dashboard')}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <UserNav />
      </div>
    </header>
  );
}
