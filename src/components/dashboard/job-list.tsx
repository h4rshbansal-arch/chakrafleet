"use client";

import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { Job, JobStatus, User, Vehicle } from "@/lib/types";
import { AiSuggestionTool } from "./ai-suggestion-tool";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, getDocs, or } from "firebase/firestore";
import { format } from "date-fns";


export function JobList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const { data: allUsers } = useCollection<User>(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: allVehicles } = useCollection<Vehicle>(useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]));

  // Memoized map for quick user lookup
  const userMap = useMemo(() => {
    if (!allUsers) return new Map();
    return new Map(allUsers.map(u => [u.id, u]));
  }, [allUsers]);

  const jobsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const q = collection(firestore, 'jobs');
    if (user.role === 'Supervisor') {
       // Supervisors see jobs they've created OR unclaimed jobs created by Admins
       return query(q, or(where('supervisorId', '==', user.id), where('status', '==', 'Unclaimed')));
    }
    if (user.role === 'Driver') {
      return query(q, where('assignedDriverId', '==', user.id));
    }
    // Admin sees all jobs
    return query(q);
  }, [firestore, user]);

  const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { status });
    if (status === 'Approved') toast({ title: t('notifications.jobApproved'), description: `Job #${jobId}` });
    if (status === 'Rejected') toast({ title: t('notifications.jobRejected'), variant: 'destructive', description: `Job #${jobId}` });
  };

  const handleClaimJob = (jobId: string) => {
    if (!user) return;
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { supervisorId: user.id, status: 'Pending' });
    toast({ title: t('notifications.jobClaimed'), description: `You have claimed Job #${jobId}` });
  };
  
  const handleAiSuggest = (job: Job) => {
    setSelectedJob(job);
    setIsAiModalOpen(true);
  };
  
  const handleAssign = (jobId: string, driverId: string, vehicleId: string) => {
    const jobRef = doc(firestore, 'jobs', jobId);
    updateDocumentNonBlocking(jobRef, { assignedDriverId: driverId, assignedVehicleId: vehicleId, status: 'Approved' });
    toast({ title: t('notifications.jobAssigned'), description: `Driver and vehicle assigned to Job #${jobId}` });
  };

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Approved":
      case "In Progress":
        return "secondary";
      case "Unclaimed":
      case "Pending":
        return "outline";
      case "Rejected":
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
            <TableHead>Supervisor</TableHead>
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
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.supervisorId ? (userMap.get(job.supervisorId)?.name || 'Unknown') : 'N/A'}</TableCell>
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
                    {user?.role === 'Admin' && job.status === 'Pending' && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'Approved')}>{t('jobs.approve')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'Rejected')}>{t('jobs.reject')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAiSuggest(job)}>{t('jobs.getAiSuggestion')}</DropdownMenuItem>
                      </>
                    )}
                     {user?.role === 'Admin' && job.status === 'Unclaimed' && (
                      <>
                        <DropdownMenuItem onClick={() => handleAiSuggest(job)}>{t('jobs.getAiSuggestion')}</DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'Driver' && (job.status === 'Approved' || job.status === 'In Progress') && (
                       <DropdownMenuItem>{t('jobs.updateStatus')}</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedJob && allUsers && allVehicles && (
         <AiSuggestionTool 
            job={selectedJob}
            isOpen={isAiModalOpen}
            onOpenChange={setIsAiModalOpen}
            onAssign={handleAssign}
            availableDrivers={allUsers.filter(u => u.role === 'Driver')}
            availableVehicles={allVehicles}
         />
      )}
    </>
  );
}
