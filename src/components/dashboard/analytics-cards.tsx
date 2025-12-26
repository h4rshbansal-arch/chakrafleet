"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { jobs, users } from "@/lib/data";
import { Clock, CheckCircle, UserCheck, PartyPopper } from "lucide-react";

export function AnalyticsCards() {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('dashboard.pendingJobs'),
      value: jobs.filter((j) => j.status === 'Pending').length,
      icon: Clock,
    },
    {
      title: t('dashboard.approvedJobs'),
      value: jobs.filter((j) => j.status === 'Approved').length,
      icon: CheckCircle,
    },
    {
      title: t('dashboard.activeDrivers'),
      value: users.filter((u) => u.role === 'Driver' && u.availability).length,
      icon: UserCheck,
    },
    {
      title: t('dashboard.completedJobs'),
      value: jobs.filter((j) => j.status === 'Completed').length,
      icon: PartyPopper,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
