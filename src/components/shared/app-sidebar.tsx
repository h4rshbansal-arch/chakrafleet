"use client";

import Link from "next/link";
import {
  Home,
  Package,
  Users,
  Truck,
  FileText,
  PlusCircle,
  History,
  PanelLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { Logo } from "@/components/icons/logo";
import { useDashboard } from "@/contexts/dashboard-context";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { setActiveTab } = useDashboard();
  const router = useRouter();

  const handleAdminNav = (tab: string) => {
    router.push('/admin/dashboard');
    setActiveTab(tab);
  };

  const navItems = {
    Admin: [
      { href: "/admin/dashboard", icon: Home, label: t('sidebar.dashboard'), action: () => handleAdminNav('jobs') },
      { href: "/admin/dashboard", icon: Package, label: t('sidebar.jobs'), action: () => handleAdminNav('jobs') },
      { href: "/admin/dashboard", icon: PlusCircle, label: t('sidebar.createJob'), action: () => handleAdminNav('create-job') },
      { href: "/admin/dashboard", icon: Users, label: t('sidebar.users'), action: () => handleAdminNav('users') },
      { href: "/admin/dashboard", icon: Truck, label: t('sidebar.vehicles'), action: () => handleAdminNav('vehicles') },
      { href: "/admin/dashboard", icon: FileText, label: t('sidebar.logs'), action: () => handleAdminNav('logs') },
    ],
    Supervisor: [
      { href: "/supervisor/dashboard", icon: Home, label: t('sidebar.dashboard') },
      { href: "/supervisor/dashboard", icon: PlusCircle, label: t('sidebar.createJob') },
      { href: "/supervisor/dashboard", icon: History, label: t('sidebar.jobHistory') },
    ],
    Driver: [
      { href: "/driver/dashboard", icon: Home, label: t('sidebar.dashboard') },
      { href: "/driver/dashboard", icon: Package, label: t('sidebar.jobs') },
      { href: "/driver/dashboard", icon: History, label: t('sidebar.jobHistory') },
    ],
  };

  const currentNavItems = user ? navItems[user.role] : [];
  
  const NavLinks = ({ isTooltip = false, inSheet = false }: { isTooltip?: boolean, inSheet?: boolean }) => (
    <TooltipProvider>
      {currentNavItems.map((item, index) => {
        const LinkContent = (
            <>
                <item.icon className="h-5 w-5" />
                {inSheet ? item.label : <span className="sr-only">{item.label}</span>}
            </>
        );

        const linkClassName = inSheet ? "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground" : "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8";

        const NavComponent = item.action ? (
            <button onClick={item.action} className={linkClassName}>
                {LinkContent}
            </button>
        ) : (
          <Link href={item.href} className={linkClassName}>
             {LinkContent}
          </Link>
        );

        if (isTooltip) {
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {NavComponent}
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }
        
        return <div key={index}>{NavComponent}</div>;
      })}
    </TooltipProvider>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">EZTransport</span>
          </Link>
          <NavLinks isTooltip />
        </nav>
      </aside>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">EZTransport</span>
              </Link>
              <NavLinks inSheet />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
