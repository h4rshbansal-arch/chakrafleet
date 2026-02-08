
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/use-language";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { ActivityLog as ActivityLogType } from "@/lib/types";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ActivityLog() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
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
    if (!firestore || userIds.length === 0) return null;
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
  
  const handleClearAllLogs = async () => {
    if (!firestore) return;
    const logsCollectionRef = collection(firestore, 'activity_logs');
    const querySnapshot = await getDocs(logsCollectionRef);

    if (querySnapshot.empty) {
        toast({ title: "No logs to clear." });
        return;
    }

    const batch = writeBatch(firestore);
    querySnapshot.forEach(logDoc => {
        batch.delete(logDoc.ref);
    });

    batch.commit().then(() => {
        toast({
            title: "Activity Logs Cleared",
            description: `Successfully deleted ${querySnapshot.size} log entries.`
        });
    }).catch((error) => {
        console.error("Error clearing activity logs:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear activity logs."
        });
    });
  };

  if (isLoadingLogs || isLoadingUsers) {
    return <div>Loading activity...</div>
  }

  return (
    <>
    <div className="flex justify-end mb-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Activity
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all {activityLogs?.length || 0} activity log entries.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllLogs} className="bg-destructive hover:bg-destructive/90">
                Yes, Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
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
        {activityLogs && activityLogs.length > 0 ? (
          activityLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{getUserName(log.userId)}</TableCell>
              <TableCell>{log.activityType}</TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell>{log.jobId || 'N/A'}</TableCell>
              <TableCell>{log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : ''}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No activity logs found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </>
  );
}
