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

export function ActivityLog() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'activity_logs'), orderBy('timestamp', 'desc'), limit(10)), [firestore]);
  const { data: activityLogs, isLoading } = useCollection<ActivityLogType>(logsQuery);
  
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users } = useCollection<User>(usersQuery);

  const getUserName = (userId: string) => {
    return users?.find(u => u.id === userId)?.name || userId;
  }
  
  if (isLoading) {
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
