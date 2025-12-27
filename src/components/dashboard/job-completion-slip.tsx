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
import { Separator } from "@/components/ui/separator";
import { Job, User, Vehicle } from "@/lib/types";
import { format } from "date-fns";
import { Truck, User as UserIcon, Calendar, MapPin, CheckCircle, FileText, Clock } from "lucide-react";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";


interface JobCompletionSlipProps {
  job: Job;
  driver?: User;
  vehicle?: Vehicle;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function JobCompletionSlip({ job, driver, vehicle, isOpen, onOpenChange }: JobCompletionSlipProps) {
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `EZTransport-Slip-${job.id}`,
    });

    const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
        <div className="flex items-start">
            <Icon className="h-4 w-4 text-muted-foreground mr-3 mt-1" />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="font-semibold text-sm">{value || "N/A"}</span>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-xl">
              <FileText />
              Job Completion Slip
            </DialogTitle>
            <DialogDescription>
              A summary of the completed job. This can be printed for your records.
            </DialogDescription>
          </DialogHeader>
          
          <div ref={componentRef} className="p-4 bg-white rounded-lg text-black">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary font-headline">EZTransport</h2>
                <div className="text-right text-xs">
                    <p className="font-semibold">Job ID: {job.id}</p>
                    {job.completionDate && (
                      <p className="text-gray-600">Completed: {format(job.completionDate.toDate(), 'PPp')}</p>
                    )}
                </div>
            </div>
            
            <div className="p-3 border rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                <p className="text-sm text-gray-700">{job.description}</p>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow icon={MapPin} label="Origin" value={job.origin} />
                <DetailRow icon={MapPin} label="Destination" value={job.destination} />
                <DetailRow icon={Calendar} label="Requested" value={job.requestDate ? format(job.requestDate.toDate(), 'PPp') : 'N/A'} />
                {job.completionDate && <DetailRow icon={Clock} label="Completed" value={job.completionDate ? format(job.completionDate.toDate(), 'PPp') : 'N/A'} />}
                <DetailRow icon={CheckCircle} label="Final Status" value={job.status} />
                

                <Separator className="md:col-span-2 my-2" />

                <DetailRow icon={UserIcon} label="Assigned Driver" value={driver?.name} />
                <DetailRow icon={Truck} label="Assigned Vehicle" value={vehicle ? `${vehicle.name} (${vehicle.type})` : undefined} />
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
                <p>Thank you for using EZTransport.</p>
                <p>&copy; {new Date().getFullYear()} EZTransport. All rights reserved.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={handlePrint}>
              Print Slip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}
