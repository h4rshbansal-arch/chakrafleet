"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Job, User } from "@/lib/types";
import { Clock, CheckCircle, UserCheck, PartyPopper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCards() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  // Queries for live data
  const pendingQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Pending')), [firestore]);
  const approvedQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Approved')), [firestore]);
  const completedQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Completed')), [firestore]);
  const driversQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '==', 'Driver'), where('availability', '==', true)), [firestore]);

  const { data: pendingJobs, isLoading: loadingPending } = useCollection<Job>(pendingQuery);
  const { data: approvedJobs, isLoading: loadingApproved } = useCollection<Job>(approvedQuery);
  const { data: completedJobs, isLoading: loadingCompleted } = useCollection<Job>(completedQuery);
  const { data: activeDrivers, isLoading: loadingDrivers } = useCollection<User>(driversQuery);

  const isLoading = loadingPending || loadingApproved || loadingCompleted || loadingDrivers;

  const stats = [
    {
      title: t('dashboard.pendingJobs'),
      value: pendingJobs?.length ?? 0,
      icon: Clock,
      loading: loadingPending,
    },
    {
      title: t('dashboard.approvedJobs'),
      value: approvedJobs?.length ?? 0,
      icon: CheckCircle,
      loading: loadingApproved,
    },
    {
      title: t('dashboard.activeDrivers'),
      value: activeDrivers?.length ?? 0,
      icon: UserCheck,
      loading: loadingDrivers,
    },
    {
      title: t('dashboard.completedJobs'),
      value: completedJobs?.length ?? 0,
      icon: PartyPopper,
      loading: loadingCompleted,
    },
  ];

  const StatSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/4" />
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {stat.loading ? <Skeleton className="h-5 w-2/3" /> : <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>}
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {stat.loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stat.value}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
