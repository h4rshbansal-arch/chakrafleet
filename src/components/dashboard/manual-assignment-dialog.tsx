"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Vehicle, Job } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, User as UserIcon, Truck as TruckIcon } from "lucide-react";

interface ManualAssignmentDialogProps {
  job: Job;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssign: (jobId: string, driverId: string, vehicleId: string) => void;
  availableDrivers: User[];
  availableVehicles: Vehicle[];
}

export function ManualAssignmentDialog({ job, isOpen, onOpenChange, onAssign, availableDrivers, availableVehicles }: ManualAssignmentDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const handleAssignClick = () => {
    if (!selectedDriverId || !selectedVehicleId) {
      toast({
        variant: "destructive",
        title: "Assignment Incomplete",
        description: "Please select both a driver and a vehicle.",
      });
      return;
    }
    onAssign(job.id, selectedDriverId, selectedVehicleId);
    onOpenChange(false);
    // Reset state for next use
    setSelectedDriverId(null);
    setSelectedVehicleId(null);
  };

  const getDriverAvailability = (driver: User) => {
    return driver.availability ? "(Available)" : "(Unavailable)";
  };
  
  const getVehicleAvailability = (vehicle: Vehicle) => {
    return vehicle.status === 'available' ? "(Available)" : `(${vehicle.status})`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Assign Job: {job.title}
          </DialogTitle>
          <DialogDescription>
            Manually select a driver and vehicle for this job.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="driver-select" className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Assign Driver
            </Label>
            <Select onValueChange={setSelectedDriverId}>
              <SelectTrigger id="driver-select">
                <SelectValue placeholder="Select an available driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id} disabled={!driver.availability}>
                    {driver.name} {getDriverAvailability(driver)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle-select" className="flex items-center gap-2">
               <TruckIcon className="h-5 w-5" />
               Assign Vehicle
            </Label>
            <Select onValueChange={setSelectedVehicleId}>
               <SelectTrigger id="vehicle-select">
                <SelectValue placeholder="Select an available vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id} disabled={vehicle.status !== 'available'}>
                    {vehicle.name} ({vehicle.type}) {getVehicleAvailability(vehicle)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('jobs.cancel')}</Button>
          <Button onClick={handleAssignClick}>
            Assign Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
