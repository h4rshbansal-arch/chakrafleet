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
import { Truck, User as UserIcon, Calendar, MapPin, Hash, CheckCircle, FileText } from "lucide-react";
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
            <Icon className="h-5 w-5 text-muted-foreground mr-4 mt-1" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-semibold">{value || "N/A"}</span>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <FileText />
              Job Completion Slip
            </DialogTitle>
            <DialogDescription>
              A summary of the completed job. This can be printed for your records.
            </DialogDescription>
          </DialogHeader>
          
          <div ref={componentRef} className="p-6 bg-white rounded-lg text-black">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-primary font-headline">EZTransport</h2>
                <div className="text-right">
                    <p className="font-semibold">Job ID: {job.id}</p>
                    <p className="text-sm text-gray-600">Completed on: {format(new Date(), 'PPpp')}</p>
                </div>
            </div>
            
            <div className="p-4 border rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">{job.title}</h3>
                <p className="text-gray-700">{job.description}</p>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailRow icon={MapPin} label="Origin" value={job.origin} />
                <DetailRow icon={MapPin} label="Destination" value={job.destination} />
                <DetailRow icon={Calendar} label="Requested Date" value={job.requestDate ? format(job.requestDate.toDate(), 'PPpp') : 'N/A'} />
                <DetailRow icon={CheckCircle} label="Job Status" value={job.status} />

                <Separator className="md:col-span-2 my-2" />

                <DetailRow icon={UserIcon} label="Assigned Driver" value={driver?.name} />
                <DetailRow icon={Hash} label="Driver ID" value={driver?.id} />
                <DetailRow icon={Truck} label="Assigned Vehicle" value={vehicle ? `${vehicle.name} (${vehicle.type})` : undefined} />
                <DetailRow icon={Hash} label="Vehicle ID" value={vehicle?.id} />
            </div>

            <div className="mt-12 text-center text-xs text-gray-500">
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
