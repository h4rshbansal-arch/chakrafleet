
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import React, { useRef } from "react";
import { Skeleton } from "../ui/skeleton";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  origin: z.string().min(2, { message: "Origin is required." }),
  destination: z.string().min(2, { message: "Destination is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  time: z.string().min(1, { message: "Time is required." }),
});

export function JobCreationForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      origin: "",
      destination: "",
      date: "",
      time: "",
    },
  });

  function handleOriginLoad(autocomplete: google.maps.places.Autocomplete) {
    originAutocompleteRef.current = autocomplete;
  }
  
  function handleDestinationLoad(autocomplete: google.maps.places.Autocomplete) {
    destinationAutocompleteRef.current = autocomplete;
  }

  function handleOriginPlaceChanged() {
    if (originAutocompleteRef.current) {
        const place = originAutocompleteRef.current.getPlace();
        form.setValue("origin", place.formatted_address || "");
    }
  }

  function handleDestinationPlaceChanged() {
    if (destinationAutocompleteRef.current) {
        const place = destinationAutocompleteRef.current.getPlace();
        form.setValue("destination", place.formatted_address || "");
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a job.", variant: "destructive"});
      return;
    }

    const jobsCollection = collection(firestore, "jobs");
    
    // Determine the status based on the user's role
    const status = user.role === 'Admin' ? 'Unclaimed' : 'Pending';

    const newJobRef = await addDocumentNonBlocking(jobsCollection, {
      ...values,
      creatorId: user.id,
      creatorRole: user.role,
      supervisorId: user.role === 'Supervisor' ? user.id : null,
      status: status,
      requestDate: serverTimestamp(),
      roundsCompleted: 0,
    });

    if (newJobRef) {
        addDocumentNonBlocking(collection(firestore, "activity_logs"), {
            jobId: newJobRef.id,
            userId: user.id,
            activityType: "Job Creation",
            description: `Job "${values.title}" created by ${user.name}`,
            timestamp: serverTimestamp(),
        });
    }

    toast({
        title: t('notifications.jobCreated'),
        description: values.title,
    });
    form.reset();
  }

  const FormSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">{t('jobs.jobCreationTitle')}</CardTitle>
        <CardDescription>{t('jobs.jobCreationDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoaded ? <FormSkeleton /> : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('jobs.title')}</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Urgent Electronics Delivery" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('jobs.description')}</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Describe the job requirements..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('jobs.origin')}</FormLabel>
                    <FormControl>
                        <Autocomplete
                            onLoad={handleOriginLoad}
                            onPlaceChanged={handleOriginPlaceChanged}
                        >
                            <Input placeholder="e.g., Warehouse A, NYC" {...field} />
                        </Autocomplete>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('jobs.destination')}</FormLabel>
                    <FormControl>
                         <Autocomplete
                            onLoad={handleDestinationLoad}
                            onPlaceChanged={handleDestinationPlaceChanged}
                        >
                            <Input placeholder="e.g., Client Office, Manhattan" {...field} />
                        </Autocomplete>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('jobs.date')}</FormLabel>
                        <FormControl>
                        <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('jobs.time')}</FormLabel>
                        <FormControl>
                        <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                {t('jobs.createJobButton')}
                </Button>
                {loadError && <p className="text-sm text-destructive">Error loading Google Maps. Please check your API key and try again.</p>}
            </form>
            </Form>
        )}
      </CardContent>
    </Card>
  );
}
