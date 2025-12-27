"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { ActivityLog } from "@/lib/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/lib/types";
import { History, FileText } from 'lucide-react';

interface JobHistoryDialogProps {
  jobId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userMap: Map<string, User>;
}

export function JobHistoryDialog({ jobId, isOpen, onOpenChange, userMap }: JobHistoryDialogProps) {
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(
    () => query(
      collection(firestore, 'activity_logs'),
      where('jobId', '==', jobId),
      orderBy('timestamp', 'desc')
    ),
    [firestore, jobId]
  );

  const { data: history, isLoading } = useCollection<ActivityLog>(historyQuery);

  const getUserName = (userId: string) => {
    return userMap.get(userId)?.name || "Unknown User";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <History />
            Job History: #{jobId}
          </DialogTitle>
          <DialogDescription>
            A chronological log of all updates and activities for this job.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-96 w-full">
            <div className="p-4">
                {isLoading && <p>Loading history...</p>}
                {!isLoading && (!history || history.length === 0) && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                        <FileText className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No History Found</h3>
                        <p className="text-sm">There are no recorded activities for this job yet.</p>
                    </div>
                )}
                <div className="relative pl-6">
                 {/* Timeline line */}
                  <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                  {history && history.map((log) => (
                      <div key={log.id} className="relative mb-8 flex items-start">
                          {/* Dot on the timeline */}
                           <div className="absolute left-6 top-1 h-3 w-3 rounded-full bg-primary -translate-x-1/2"></div>
                          <div className="ml-8">
                              <p className="font-semibold">{log.activityType}</p>
                              <p className="text-sm">{log.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                By {getUserName(log.userId)} on {log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : ''}
                              </p>
                          </div>
                      </div>
                  ))}
                </div>
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
