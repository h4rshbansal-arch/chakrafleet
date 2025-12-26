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

export function ActivityLog() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'activity_logs'), orderBy('timestamp', 'desc'), limit(10)), [firestore]);
  const { data: activityLogs, isLoading } = useCollection<ActivityLogType>(logsQuery);
  
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
            <TableCell className="font-medium">{log.userId}</TableCell> // In a real app, you'd fetch the user's name
            <TableCell>{log.activityType}</TableCell>
            <TableCell>{log.description}</TableCell>
            <TableCell>{log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
