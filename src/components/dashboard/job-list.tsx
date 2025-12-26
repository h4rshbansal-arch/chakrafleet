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
import { jobs as initialJobs, users, vehicles } from "@/lib/data";
import { Job, JobStatus } from "@/lib/types";
import { AiSuggestionTool } from "./ai-suggestion-tool";
import { useToast } from "@/hooks/use-toast";

export function JobList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status } : job));
    if (status === 'Approved') toast({ title: t('notifications.jobApproved'), description: `Job #${jobId}` });
    if (status === 'Rejected') toast({ title: t('notifications.jobRejected'), variant: 'destructive', description: `Job #${jobId}` });
  };
  
  const handleAiSuggest = (job: Job) => {
    setSelectedJob(job);
    setIsAiModalOpen(true);
  };
  
  const handleAssign = (jobId: string, driverId: string, vehicleId: string) => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, driverId, vehicleId, status: 'Approved' } : job));
    toast({ title: t('notifications.jobAssigned'), description: `Driver and vehicle assigned to Job #${jobId}` });
  };

  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Approved":
        return "secondary";
      case "In Progress":
        return "secondary";
      case "Pending":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredJobs = user?.role === 'Supervisor' 
    ? jobs.filter(job => job.supervisorId === user.id)
    : user?.role === 'Driver' 
    ? jobs.filter(job => job.driverId === user.id)
    : jobs;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('jobs.title')}</TableHead>
            <TableHead>{t('jobs.origin')}</TableHead>
            <TableHead>{t('jobs.destination')}</TableHead>
            <TableHead>{t('jobs.date')}</TableHead>
            <TableHead>{t('jobs.status')}</TableHead>
            <TableHead>
              <span className="sr-only">{t('jobs.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.origin}</TableCell>
              <TableCell>{job.destination}</TableCell>
              <TableCell>{job.date}</TableCell>
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
                    {user?.role === 'Admin' && job.status === 'Pending' && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'Approved')}>{t('jobs.approve')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'Rejected')}>{t('jobs.reject')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
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
      {selectedJob && (
         <AiSuggestionTool 
            job={selectedJob}
            isOpen={isAiModalOpen}
            onOpenChange={setIsAiModalOpen}
            onAssign={handleAssign}
            availableDrivers={users.filter(u => u.role === 'Driver')}
            availableVehicles={vehicles}
         />
      )}
    </>
  );
}
