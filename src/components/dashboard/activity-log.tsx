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
import { ActivityLog as ActivityLogType } from "@/lib/types";
import { format } from "date-fns";
import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";

export function ActivityLog() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const { user: currentUser } = useAuth();
  
  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50)), [firestore]);
  const { data: activityLogs, isLoading: isLoadingLogs } = useCollection<ActivityLogType>(logsQuery);
  
  const userIds = useMemo(() => {
    if (!activityLogs) return [];
    // Create a unique set of user IDs from the logs
    return [...new Set(activityLogs.map(log => log.userId))];
  }, [activityLogs]);
  
  // Note: This approach fetches all users involved in the recent logs.
  // For very large systems, a more optimized approach might be needed,
  // but for a moderate number of logs, this is efficient.
  const usersQuery = useMemoFirebase(() => {
    if (userIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('id', 'in', userIds));
  }, [firestore, userIds]);
  
  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    if (users) {
      users.forEach(u => map.set(u.id, u.name));
    }
     if (currentUser) {
      map.set(currentUser.id, currentUser.name);
    }
    return map;
  }, [users, currentUser]);

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
          <TableHead>Job ID</TableHead>
          <TableHead>{t('logs.timestamp')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activityLogs && activityLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{getUserName(log.userId)}</TableCell>
            <TableCell>{log.activityType}</TableCell>
            <TableCell>{log.description}</TableCell>
            <TableCell>{log.jobId || 'N/A'}</TableCell>
            <TableCell>{log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
