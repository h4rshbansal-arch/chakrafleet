"use client";

import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobCreationForm } from "@/components/dashboard/job-creation-form";
import { JobList } from "@/components/dashboard/job-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context";
import { FilePlus, List, FileCheck } from "lucide-react";

function SupervisorDashboardContent() {
  const { activeTab, setActiveTab } = useDashboard();

  return (
    <div className="space-y-8">
      <AnalyticsCards />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 md:w-auto md:grid-cols-3">
          <TabsTrigger value="my-jobs"><List className="mr-2 h-4 w-4" /> My Jobs</TabsTrigger>
          <TabsTrigger value="available-jobs"><FileCheck className="mr-2 h-4 w-4" /> Available Jobs</TabsTrigger>
          <TabsTrigger value="create-job"><FilePlus className="mr-2 h-4 w-4" /> Create Job</TabsTrigger>
        </TabsList>
        <TabsContent value="my-jobs">
            <Card>
                <CardHeader>
                    <CardTitle>My Jobs</CardTitle>
                    <CardDescription>
                        A list of jobs you have created or claimed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <JobList />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="available-jobs">
            <Card>
                <CardHeader>
                    <CardTitle>Available Jobs</CardTitle>
                    <CardDescription>
                        Jobs created by an Admin that are available to be claimed.
                    </CardDescription>
                </Header>
                <CardContent>
                    <JobList showOnlyUnclaimed={true} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="create-job">
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <JobCreationForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SupervisorDashboard() {
  return (
    <DashboardProvider defaultTab="my-jobs">
      <SupervisorDashboardContent />
    </DashboardProvider>
  )
}
