"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Vehicle, Job, User as Driver } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { suggestDriversAndVehicles, SuggestDriversAndVehiclesOutput } from "@/ai/flows/suggest-drivers-and-vehicles";
import { users as allUsers, vehicles as allVehicles, historicalJobData } from "@/lib/data";
import { Lightbulb, User as UserIcon, Truck as TruckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AiSuggestionToolProps {
  job: Job;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssign: (jobId: string, driverId: string, vehicleId: string) => void;
  availableDrivers: Driver[];
  availableVehicles: Vehicle[];
}

export function AiSuggestionTool({ job, isOpen, onOpenChange, onAssign, availableDrivers, availableVehicles }: AiSuggestionToolProps) {
  const { t } = useLanguage();
  const [suggestion, setSuggestion] = useState<SuggestDriversAndVehiclesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestion();
    } else {
      // Reset state when closing
      setSuggestion(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await suggestDriversAndVehicles({
        jobDescription: job.description,
        availableDrivers: availableDrivers.map(d => ({
          driverId: d.id,
          availability: d.availability ?? false,
          currentLocation: d.currentLocation ?? 'Unknown',
          pastJobs: d.pastJobs,
        })),
        availableVehicles: availableVehicles.map(v => ({
          vehicleId: v.id,
          status: v.status,
          location: v.location,
          type: v.type,
          capacity: v.capacity,
        })),
        historicalJobData: historicalJobData,
      });
      setSuggestion(result);
    } catch (e) {
      setError("Failed to get AI suggestion. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignClick = () => {
    if (suggestion) {
      onAssign(job.id, suggestion.driverSuggestion.driverId, suggestion.vehicleSuggestion.vehicleId);
      onOpenChange(false);
    }
  };

  const suggestedDriver = suggestion ? allUsers.find(u => u.id === suggestion.driverSuggestion.driverId) : null;
  const suggestedVehicle = suggestion ? allVehicles.find(v => v.id === suggestion.vehicleSuggestion.vehicleId) : null;

  const SuggestionSkeleton = () => (
    <div className="space-y-6">
      <p className="text-center text-muted-foreground">{t('jobs.fetchingSuggestion')}</p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Lightbulb className="h-6 w-6 text-accent" />
            {t('jobs.aiSuggestionTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('jobs.aiSuggestionDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {isLoading && <SuggestionSkeleton />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {suggestion && suggestedDriver && suggestedVehicle && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    {t('jobs.driverSuggestion')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{suggestedDriver.name}</p>
                  <p className="text-sm text-muted-foreground">{suggestedDriver.currentLocation}</p>
                  <Separator className="my-3" />
                  <p className="text-sm font-semibold">{t('jobs.reason')}:</p>
                  <p className="text-sm text-muted-foreground italic">"{suggestion.driverSuggestion.reason}"</p>
                </CardContent>
              </Card>
              <Card className="border-primary/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    {t('jobs.vehicleSuggestion')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{suggestedVehicle.name}</p>
                  <p className="text-sm text-muted-foreground">{suggestedVehicle.type} - {suggestedVehicle.capacity}</p>
                   <Separator className="my-3" />
                  <p className="text-sm font-semibold">{t('jobs.reason')}:</p>
                  <p className="text-sm text-muted-foreground italic">"{suggestion.vehicleSuggestion.reason}"</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('jobs.cancel')}</Button>
          <Button onClick={handleAssignClick} disabled={isLoading || !suggestion} className="bg-accent hover:bg-accent/90">
            {t('jobs.assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
