
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle, XCircle, Truck, User as UserIcon, Archive, Trash2, Replace, FileText, History, ArchiveRestore, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { Job, JobStatus, User, Vehicle } from "@/lib/types";
import { ManualAssignmentDialog } from "./manual-assignment-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
import { format, sub } from "date-fns";
import { JobCompletionSlip } from "./job-completion-slip";
import { JobHistoryDialog } from "./job-history-dialog";
import { Input } from "../ui/input";

interface JobListProps {
  showOnlyUnclaimed?: boolean;
  jobStatus?: JobStatus[];
}

export function JobList({ showOnlyUnclaimed = false, jobStatus }: JobListProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSlipModalOpen, setisSlipModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<User>(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: allVehicles, isLoading: isLoadingVehicles } = useCollection<Vehicle>(useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]));

  const isArchivedView = useMemo(() => jobStatus?.length === 1 && jobStatus[0] === 'Archived', [jobStatus]);

  // Auto-delete old archived jobs
  useEffect(() => {
    const autoDeleteOldJobs = async () => {
      if (!firestore || user?.role !== 'Admin') return;

      const lastCleanupDate = localStorage.getItem('lastJobCleanupDate');
      const today = new Date().toDateString();

      if (lastCleanupDate === today) return; // Already cleaned up today

      try {
        const twoMonthsAgo = sub(new Date(), { months: 2 });
        const archivedJobsQuery = query(collection(firestore, 'jobs'), where('status', '==', 'Archived'));
        const querySnapshot = await getDocs(archivedJobsQuery);
        
        const batch = writeBatch(firestore);
        let deletedCount = 0;

        querySnapshot.forEach((jobDoc) => {
          const job = jobDoc.data() as Job;
          // Use completionDate if available, otherwise fallback to requestDate
          const jobDate = job.completionDate?.toDate() || job.requestDate?.toDate();
          if (jobDate && jobDate < twoMonthsAgo) {
            batch.delete(jobDoc.ref);
            deletedCount++;
          }
        });

        if (deletedCount > 0) {
          await batch.commit();
          toast({
            title: "Auto-Cleanup Complete",
            description: `${deletedCount} archived jobs older than 2 months have been deleted.`,
          });
        }

        localStorage.setItem('lastJobCleanupDate', today);
      } catch (error) {
        console.error("Error during auto-deletion of old jobs:", error);
      }
    };

    autoDeleteOldJobs();
  }, [firestore, user]);


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
    
    // If jobStatus prop is provided, use it. Otherwise, fetch all non-archived jobs for general lists.
    const visibleStatuses: JobStatus[] = jobStatus || ['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Unclaimed'];

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
    // Admin sees all jobs based on the status filter
    return query(q, where('status', 'in', visibleStatuses));
  }, [firestore, user, showOnlyUnclaimed, jobStatus]);

  const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      const driverName = job.assignedDriverId ? userMap.get(job.assignedDriverId)?.name || '' : '';
      const supervisorName = job.supervisorId ? userMap.get(job.supervisorId)?.name || '' : '';
      const vehicleName = job.assignedVehicleId ? vehicleMap.get(job.assignedVehicleId)?.name || '' : '';

      return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [jobs, searchTerm, userMap, vehicleMap]);
  
  const createLog = (jobId: string, activityType: string, description: string) => {
    if(!user) return;
    addDocumentNonBlocking(collection(firestore, "activity_logs"), {
        jobId,
        userId: user.id,
        activityType,
        description,
        timestamp: serverTimestamp(),
    });
  }

  const handleStatusChange = (job: Job, status: JobStatus) => {
    const jobRef = doc(firestore, 'jobs', job.id);
    const updateData: any = { status };
    if (status === 'Completed') {
        updateData.completionDate = serverTimestamp();
    }
    updateDocumentNonBlocking(jobRef, updateData);
    createLog(job.id, "Status Update", `Job status changed to ${status}`);
    toast({ title: t('notifications.statusUpdated'), description: `Job #${job.id} is now ${status}` });
  };

  const handleClaimJob = (job: Job) => {
    if (!user) return;
    const jobRef = doc(firestore, 'jobs', job.id);
    updateDocumentNonBlocking(jobRef, { supervisorId: user.id, status: 'Pending' });
    createLog(job.id, "Job Claimed", `Job claimed by supervisor ${user.name}`);
    toast({ title: t('notifications.jobClaimed'), description: `You have claimed Job #${job.id}` });
  };
  
  const handleOpenAssignment = (job: Job) => {
    setSelectedJob(job);
    setIsAssignmentModalOpen(true);
  };
  
  const handleOpenSlip = (job: Job) => {
    setSelectedJob(job);
    setisSlipModalOpen(true);
  };
  
  const handleOpenHistory = (job: Job) => {
    setSelectedJob(job);
    setIsHistoryModalOpen(true);
  }

  const handleAssign = (jobId: string, driverId: string, vehicleId: string) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    const currentJob = jobs?.find(j => j.id === jobId);

    // If the job is already approved, we are just changing the assignment, so we don't change the status
    const newStatus = currentJob?.status === 'Approved' ? 'Approved' : 'Approved';

    updateDocumentNonBlocking(jobRef, { 
      assignedDriverId: driverId, 
      assignedVehicleId: vehicleId, 
      status: newStatus 
    });

    const driverName = userMap.get(driverId)?.name || "Unknown";
    const vehicleName = vehicleMap.get(vehicleId)?.name || "Unknown";
    createLog(jobId, "Assignment", `Assigned to Driver: ${driverName}, Vehicle: ${vehicleName}`);
    
    toast({ 
      title: t('notifications.jobAssigned'), 
      description: `Driver and vehicle assigned to Job #${jobId}` 
    });
  };
  
  const handleReject = (job: Job) => {
    const jobRef = doc(firestore, 'jobs', job.id);
    updateDocumentNonBlocking(jobRef, { status: 'Rejected' });
    createLog(job.id, "Job Rejected", `Job was rejected.`);
    toast({ title: t('notifications.jobRejected'), variant: 'destructive', description: `Job #${job.id}` });
  }

  const handleArchive = (job: Job) => {
    const jobRef = doc(firestore, 'jobs', job.id);
    updateDocumentNonBlocking(jobRef, { status: 'Archived', previousStatus: job.status });
    createLog(job.id, "Job Archived", `Job was archived.`);
    toast({ title: 'Job Archived' });
  };
  
  const handleUnarchive = (job: Job) => {
    const jobRef = doc(firestore, 'jobs', job.id);
    // Restore to 'Completed' as a sensible default, or use a stored previous status if available.
    const restoredStatus: JobStatus = (job as any).previousStatus || 'Completed';
    updateDocumentNonBlocking(jobRef, { status: restoredStatus, previousStatus: null });
    createLog(job.id, "Job Unarchived", `Job was unarchived.`);
    toast({ title: 'Job Unarchived' });
  };
  
  const handleDeleteAllArchived = async () => {
    if (!firestore || !jobs) return;
    const archivedJobs = jobs.filter(j => j.status === 'Archived');
    if (archivedJobs.length === 0) {
      toast({ title: "No jobs to delete." });
      return;
    }
    const batch = writeBatch(firestore);
    archivedJobs.forEach(job => {
      const jobRef = doc(firestore, 'jobs', job.id);
      batch.delete(jobRef);
    });
    try {
      await batch.commit();
      toast({
        title: "All Archived Jobs Deleted",
        description: `${archivedJobs.length} jobs have been permanently deleted.`
      });
    } catch (error) {
      console.error("Error deleting all archived jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete archived jobs."
      });
    }
  };


  const handleDeletePermanent = (job: Job) => {
    const jobRef = doc(firestore, 'jobs', job.id);
    deleteDocumentNonBlocking(jobRef);
    toast({
      title: 'Job Deleted Permanently',
      variant: 'destructive'
    });
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
  
  if (isLoadingJobs || isLoadingUsers || isLoadingVehicles) {
    return <div>Loading jobs...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search jobs..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        {isArchivedView && user?.role === 'Admin' && (
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Archived
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all {jobs?.filter(j => j.status === 'Archived').length || 0} archived jobs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllArchived} className="bg-destructive hover:bg-destructive/90">
                    Yes, Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('jobs.title')}</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>{t('jobs.status')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('jobs.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredJobs && filteredJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-bold">{job.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {job.origin} to {job.destination}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
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
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>Due: {formatJobDate(job.date, job.time)}</span>
                  {job.completionDate && (
                    <span className="text-green-600">
                      Completed: {format(job.completionDate.toDate(), 'PPpp')}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
              </TableCell>
              <TableCell>
                 <AlertDialog>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('jobs.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user?.role === 'Admin' && (
                            <DropdownMenuItem onSelect={() => handleOpenHistory(job)}>
                               <History className="mr-2 h-4 w-4" />
                                View History
                            </DropdownMenuItem>
                        )}
                        {job.status === 'Completed' && (
                          <DropdownMenuItem onSelect={() => handleOpenSlip(job)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Slip
                          </DropdownMenuItem>
                        )}
                        
                        {user?.role === 'Supervisor' && job.status === 'Unclaimed' && (
                            <DropdownMenuItem onClick={() => handleClaimJob(job)}>{t('jobs.claim')}</DropdownMenuItem>
                        )}
                        {user?.role === 'Admin' && (
                        <>
                            {(job.status === 'Pending' || job.status === 'Unclaimed') && (
                            <>
                                <DropdownMenuItem onClick={() => handleOpenAssignment(job)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t('jobs.approveAndAssign')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(job)} className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                {t('jobs.reject')}
                                </DropdownMenuItem>
                            </>
                            )}

                            {job.status === 'Approved' && (
                                <DropdownMenuItem onClick={() => handleOpenAssignment(job)}>
                                <Replace className="mr-2 h-4 w-4" />
                                Change Assignment
                                </DropdownMenuItem>
                            )}

                            {(job.status === 'Completed' || job.status === 'Rejected') && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleArchive(job)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                                </DropdownMenuItem>
                            </>
                            )}
                             {job.status === 'Archived' && (
                                <>
                                 <DropdownMenuItem onClick={() => handleUnarchive(job)}>
                                  <ArchiveRestore className="mr-2 h-4 w-4" />
                                  Unarchive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Permanently
                                    </DropdownMenuItem>
                                 </AlertDialogTrigger>
                                </>
                            )}
                        </>
                        )}
                        {user?.role === 'Driver' && (job.status === 'Approved' || job.status === 'In Transit') && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>{t('jobs.updateStatus')}</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {job.status === 'Approved' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(job, 'In Transit')}>
                                    {t('jobs.startTransit')}
                                </DropdownMenuItem>
                                )}
                                {job.status === 'In Transit' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(job, 'Completed')}>
                                    {t('jobs.markComplete')}
                                </DropdownMenuItem>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        )}
                    </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the job from the database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePermanent(job)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
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
            availableDrivers={allUsers.filter(u => u.role === 'Driver' && u.availability)}
            availableVehicles={allVehicles.filter(v => v.status === 'available')}
         />
      )}
      {selectedJob && isSlipModalOpen && allUsers && allVehicles && (
        <JobCompletionSlip
          job={selectedJob}
          driver={userMap.get(selectedJob.assignedDriverId || "")}
          vehicle={vehicleMap.get(selectedJob.assignedVehicleId || "")}
          isOpen={isSlipModalOpen}
          onOpenChange={setisSlipModalOpen}
        />
      )}
       {selectedJob && isHistoryModalOpen && (
        <JobHistoryDialog
            jobId={selectedJob.id}
            isOpen={isHistoryModalOpen}
            onOpenChange={setIsHistoryModalOpen}
            userMap={userMap}
        />
      )}
    </>
  );
}
