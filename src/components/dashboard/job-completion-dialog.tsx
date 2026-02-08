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
import { Milestone, ChevronsRight } from "lucide-react";

interface JobCompletionDialogProps {
  job: Job;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (jobId: string, rounds: number, kilometers: number) => void;
}

export function JobCompletionDialog({ job, isOpen, onOpenChange, onConfirm }: JobCompletionDialogProps) {
  const [rounds, setRounds] = useState("");
  const [kmPerRound, setKmPerRound] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    const roundsNum = parseInt(rounds, 10);
    const kmPerRoundNum = parseFloat(kmPerRound);

    if (isNaN(roundsNum) || roundsNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number of rounds.",
      });
      return;
    }
    if (isNaN(kmPerRoundNum) || kmPerRoundNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid kilometers.",
      });
      return;
    }

    const totalKilometers = roundsNum * kmPerRoundNum;
    onConfirm(job.id, roundsNum, totalKilometers);
    onOpenChange(false);
    setRounds("");
    setKmPerRound("");
  };

  // This prevents closing the dialog by clicking outside or pressing Escape.
  const preventClose = (e: Event) => e.preventDefault();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={preventClose}
        onPointerDownOutside={preventClose}
        hideCloseButton={true} 
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Milestone />
            Complete Job & Enter Details
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please enter the final details for job "{job.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rounds" className="flex items-center gap-2"><ChevronsRight /> Number of rounds completed</Label>
            <Input
              id="rounds"
              type="number"
              placeholder="e.g., 4"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kilometers">Kilometers in one round (एक राउंड में किलोमीटर)</Label>
            <Input
              id="kilometers"
              type="number"
              placeholder="e.g., 25.5"
              value={kmPerRound}
              onChange={(e) => setKmPerRound(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">Confirm & Complete Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// We need to extend the DialogContent to conditionally hide the close button
const OriginalDialogContent = DialogContent;
const NewDialogContent = React.forwardRef<
  React.ElementRef<typeof OriginalDialogContent>,
  React.ComponentPropsWithoutRef<typeof OriginalDialogContent> & { hideCloseButton?: boolean }
>(({ hideCloseButton, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} {...props}>
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
NewDialogContent.displayName = "NewDialogContent";
(JobCompletionDialog as any).DialogContent = NewDialogContent;

// This part is tricky, I can't just re-export from ui/dialog. I need to replicate it here for JobCompletionDialog to use it.
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={"fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
