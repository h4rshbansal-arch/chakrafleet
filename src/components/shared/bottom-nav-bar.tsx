"use client";

import { useDashboard } from "@/contexts/dashboard-context";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface Tab {
    value: string;
    label: string;
    icon: LucideIcon;
}

interface BottomNavBarProps {
    tabs: Tab[];
}

export function BottomNavBar({ tabs }: BottomNavBarProps) {
    const { activeTab, setActiveTab } = useDashboard();
    
    // Select a subset of tabs for the bottom nav bar
    const navTabs = tabs.filter(tab => ['jobs', 'create-job', 'users', 'vehicles', 'logs'].includes(tab.value));


    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                {navTabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
                             activeTab === tab.value ? "text-primary dark:text-primary" : "text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <tab.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{tab.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
