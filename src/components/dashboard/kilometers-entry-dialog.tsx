
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Job } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Milestone } from "lucide-react";

interface KilometersEntryDialogProps {
  job: Job;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (jobId: string, kilometers: number) => void;
}

export function KilometersEntryDialog({ job, isOpen, onOpenChange, onConfirm }: KilometersEntryDialogProps) {
  const [kilometers, setKilometers] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    const kms = parseFloat(kilometers);
    if (isNaN(kms) || kms <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number of kilometers.",
      });
      return;
    }
    onConfirm(job.id, kms);
    onOpenChange(false);
    setKilometers("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Milestone />
            Complete Job & Enter Kilometers
          </DialogTitle>
          <DialogDescription>
            Before completing the job "{job.title}", please enter the total kilometers driven.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kilometers">Kilometers Driven</Label>
            <Input
              id="kilometers"
              type="number"
              placeholder="e.g., 125.5"
              value={kilometers}
              onChange={(e) => setKilometers(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm & Complete Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
