
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
import React from "react";

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a job.", variant: "destructive"});
      return;
    }

    const jobsCollection = collection(firestore, "jobs");
    
    // Determine the status based on the user's role
    const status = user.role === 'Admin' ? 'Unclaimed' : 'Pending';

    addDocumentNonBlocking(jobsCollection, {
      ...values,
      creatorId: user.id,
      creatorRole: user.role,
      supervisorId: user.role === 'Supervisor' ? user.id : null,
      status: status,
      requestDate: serverTimestamp(),
      roundsCompleted: 0,
      kilometersDriven: 0,
    }).then(newJobRef => {
        if (newJobRef) {
            addDocumentNonBlocking(collection(firestore, "activity_logs"), {
                jobId: newJobRef.id,
                userId: user.id,
                activityType: "Job Creation",
                description: `Job "${values.title}" created by ${user.name}`,
                timestamp: serverTimestamp(),
            });
        }
    });

    toast({
        title: t('notifications.jobCreated'),
        description: values.title,
    });
    form.reset();
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">{t('jobs.jobCreationTitle')}</CardTitle>
        <CardDescription>{t('jobs.jobCreationDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
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
                    <Input placeholder="e.g., Warehouse A, NYC" {...field} />
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
                    <Input placeholder="e.g., Client Office, Manhattan" {...field} />
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
        </form>
        </Form>
      </CardContent>
    </Card>
  );
}
