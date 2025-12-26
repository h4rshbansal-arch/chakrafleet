"use client";

import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobCreationForm } from "@/components/dashboard/job-creation-form";
import { JobList } from "@/components/dashboard/job-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, List } from "lucide-react";

export default function SupervisorDashboard() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <AnalyticsCards />
        <Card>
          <CardHeader>
            <CardTitle>Job Board</CardTitle>
            <CardDescription>
              A list of your jobs and unclaimed jobs from admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobList />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create a Job</CardTitle>
            <CardDescription>Request a new transport job.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobCreationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
