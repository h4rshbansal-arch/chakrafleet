"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/hooks/use-language";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { ActivityLog as ActivityLogType, User } from "@/lib/types";
import { format } from "date-fns";
import { useMemo } from "react";

export function ActivityLog() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50)), [firestore]);
  const { data: activityLogs, isLoading: isLoadingLogs } = useCollection<ActivityLogType>(logsQuery);
  
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  // Memoize the user map for performance. This is crucial to prevent re-renders.
  const userMap = useMemo(() => {
    if (!users) return new Map<string, string>();
    return new Map(users.map(u => [u.id, u.name]));
  }, [users]);

  const getUserName = (userId: string) => {
    return userMap.get(userId) || "Unknown User";
  };
  
  if (isLoadingLogs || isLoadingUsers) {
    return <div>Loading activity...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('logs.user')}</TableHead>
          <TableHead>{t('logs.action')}</TableHead>
          <TableHead>{t('logs.details')}</TableHead>
          <TableHead>{t('logs.timestamp')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activityLogs && activityLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{getUserName(log.userId)}</TableCell>
            <TableCell>{log.activityType}</TableCell>
            <TableCell>{log.description}</TableCell>
            <TableCell>{log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
