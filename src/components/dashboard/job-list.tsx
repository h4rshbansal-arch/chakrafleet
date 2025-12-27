"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle, XCircle, Truck, User as UserIcon, Archive } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { Job, JobStatus, User, Vehicle } from "@/lib/types";
import { ManualAssignmentDialog } from "./manual-assignment-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, or } from "firebase/firestore";
import { format } from "date-fns";

interface JobListProps {
  showOnlyUnclaimed?: boolean;
}

export function JobList({ showOnlyUnclaimed = false }: JobListProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const { data: allUsers } = useCollection<User>(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: allVehicles } = useCollection<Vehicle>(useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]));

  // Memoized map for quick user lookup
  const userMap = useMemo(() => {
    if (!allUsers) return new Map();
    return new Map(allUsers.map(u => [u.id, u]));
  }, [allUsers]);
  
  const vehicleMap = useMemo(() => {
    if (!allVehicles) return new Map();
    return new Map(allVehicles.map(v => [v.id, v]));
  }, [allVehicles]);

  const jobsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const q = collection(firestore, 'jobs');
    
    const visibleStatuses: JobStatus[] = ['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Unclaimed'];

    if (user.role === 'Supervisor') {
       if (showOnlyUnclaimed) {
         // Show only unclaimed jobs created by Admins
         return query(q, where('status', '==', 'Unclaimed'));
       }
       // Supervisors see jobs they've created OR claimed
       return query(q, where('supervisorId', '==', user.id), where('status', 'in', visibleStatuses));
    }
    if (user.role === 'Driver') {
      return query(q, where('assignedDriverId', '==', user.id), where('status', 'in', visibleStatuses));
    }
    // Admin sees all non-archived jobs
    return query(q, where('status', 'in', visibleStatuses));
  }, [firestore, user, showOnlyUnclaimed]);

  const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { status });
    toast({ title: t('notifications.statusUpdated'), description: `Job #${jobId} is now ${status}` });
  };

  const handleClaimJob = (jobId: string) => {
    if (!user) return;
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { supervisorId: user.id, status: 'Pending' });
    toast({ title: t('notifications.jobClaimed'), description: `You have claimed Job #${jobId}` });
  };
  
  const handleOpenManualAssign = (job: Job) => {
    setSelectedJob(job);
    setIsAssignmentModalOpen(true);
  };
  
  const handleAssign = (jobId: string, driverId: string, vehicleId: string) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { assignedDriverId: driverId, assignedVehicleId: vehicleId, status: 'Approved' });
    toast({ title: t('notifications.jobAssigned'), description: `Driver and vehicle assigned to Job #${jobId}` });
  };
  
  const handleReject = (jobId: string) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { status: 'Rejected' });
    toast({ title: t('notifications.jobRejected'), variant: 'destructive', description: `Job #${jobId}` });
  }

  const handleArchive = (jobId: string) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { status: 'Archived' });
    toast({ title: 'Job Archived' });
  };

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Approved":
      case "In Transit":
        return "secondary";
      case "Unclaimed":
      case "Pending":
        return "outline";
      case "Rejected":
      case "Archived":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <div>Loading jobs...</div>
  }

  const formatJobDate = (dateString: string, timeString?: string) => {
    try {
      if (!timeString) {
        return format(new Date(dateString), 'PP');
      }
      const [hours, minutes] = timeString.split(':');
      const date = new Date(dateString);
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'PPpp');
    } catch (error) {
      return dateString;
    }
  };


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('jobs.title')}</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead>{t('jobs.destination')}</TableHead>
            <TableHead>{t('jobs.date')}</TableHead>
            <TableHead>{t('jobs.status')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('jobs.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs && jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{job.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {job.supervisorId ? `Sup: ${userMap.get(job.supervisorId)?.name || 'Unknown'}` : 'Unsupervised'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                 <div className="flex flex-col text-sm">
                    {job.assignedDriverId ? (
                        <div className="flex items-center gap-2">
                           <UserIcon className="h-4 w-4 text-muted-foreground" /> 
                           <span>{userMap.get(job.assignedDriverId)?.name || 'Unknown Driver'}</span>
                        </div>
                    ) : <span className="text-muted-foreground">No driver</span>}
                    {job.assignedVehicleId ? (
                        <div className="flex items-center gap-2">
                           <Truck className="h-4 w-4 text-muted-foreground" /> 
                           <span>{vehicleMap.get(job.assignedVehicleId)?.name || 'Unknown Vehicle'}</span>
                        </div>
                    ) : <span className="text-muted-foreground">No vehicle</span>}
                 </div>
              </TableCell>
              <TableCell>{job.destination}</TableCell>
              <TableCell>{formatJobDate(job.date, job.time)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('jobs.actions')}</DropdownMenuLabel>
                    <DropdownMenuItem>{t('jobs.view')}</DropdownMenuItem>
                     {user?.role === 'Supervisor' && job.status === 'Unclaimed' && (
                        <DropdownMenuItem onClick={() => handleClaimJob(job.id)}>{t('jobs.claim')}</DropdownMenuItem>
                    )}
                    {user?.role === 'Admin' && (
                      <>
                        {(job.status === 'Pending' || job.status === 'Unclaimed') && (
                           <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenManualAssign(job)}>
                               <CheckCircle className="mr-2 h-4 w-4" />
                               {t('jobs.approveAndAssign')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(job.id)} className="text-destructive">
                               <XCircle className="mr-2 h-4 w-4" />
                               {t('jobs.reject')}
                            </DropdownMenuItem>
                           </>
                        )}
                        {(job.status === 'Completed' || job.status === 'Rejected') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchive(job.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}
                    {user?.role === 'Driver' && (job.status === 'Approved' || job.status === 'In Transit') && (
                       <DropdownMenuSub>
                          <DropdownMenuSubTrigger>{t('jobs.updateStatus')}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                             <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'In Transit')}>
                                {t('jobs.startTransit')}
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'Completed')}>
                                {t('jobs.markComplete')}
                             </DropdownMenuItem>
                          </DropdownMenuSubContent>
                       </DropdownMenuSub>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedJob && allUsers && allVehicles && (
         <ManualAssignmentDialog 
            job={selectedJob}
            isOpen={isAssignmentModalOpen}
            onOpenChange={setIsAssignmentModalOpen}
            onAssign={handleAssign}
            availableDrivers={allUsers.filter(u => u.role === 'Driver')}
            availableVehicles={allVehicles}
         />
      )}
    </>
  );
}
