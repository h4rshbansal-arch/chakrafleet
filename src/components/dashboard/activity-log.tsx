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
import { activityLogs } from "@/lib/data";

export function ActivityLog() {
  const { t } = useLanguage();

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
        {activityLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.user}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.details}</TableCell>
            <TableCell>{log.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
