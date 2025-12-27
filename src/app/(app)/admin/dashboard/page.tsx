"use client";

import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobList } from "@/components/dashboard/job-list";
import { UserManagement } from "@/components/dashboard/user-management";
import { VehicleManagement } from "@/components/dashboard/vehicle-management";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Truck, FileText, PlusCircle, Archive, Settings } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context";
import { JobCreationForm } from "@/components/dashboard/job-creation-form";
import { Settings as SettingsComponent } from "@/components/dashboard/settings";

function AdminDashboardContent() {
  const { activeTab, setActiveTab } = useDashboard();

  return (
    <div className="space-y-8">
      <AnalyticsCards />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="jobs"><Package className="mr-2 h-4 w-4" /> Job Requests</TabsTrigger>
          <TabsTrigger value="create-job"><PlusCircle className="mr-2 h-4 w-4" /> Create Job</TabsTrigger>
          <TabsTrigger value="archived"><Archive className="mr-2 h-4 w-4" /> Archived Jobs</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> User Management</TabsTrigger>
          <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4" /> Vehicle Management</TabsTrigger>
          <TabsTrigger value="logs"><FileText className="mr-2 h-4 w-4" /> Activity Log</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <JobList jobStatus={['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Unclaimed']} />
        </TabsContent>
        <TabsContent value="create-job">
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <JobCreationForm />
            </div>
          </div>
        </TabsContent>
         <TabsContent value="archived">
          <JobList jobStatus={['Archived']} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="vehicles">
          <VehicleManagement />
        </TabsContent>
        <TabsContent value="logs">
          <ActivityLog />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function AdminDashboard() {
  return (
    <DashboardProvider>
      <AdminDashboardContent />
    </DashboardProvider>
  );
}
