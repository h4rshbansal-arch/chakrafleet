"use client";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { UserNav } from "./user-nav";
import { LanguageToggle } from "./language-toggle";
import { Logo } from "../icons/logo";
import Link from "next/link";


export function Header() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2"
          >
            <Logo className="h-6 w-6 text-primary transition-all group-hover:scale-110" />
            <span className="font-headline text-lg font-bold text-primary">EZTransport</span>
          </Link>
      
      <div className="ml-auto flex items-center gap-2">
        <LanguageToggle />
        <UserNav />
      </div>
    </header>
  );
}
