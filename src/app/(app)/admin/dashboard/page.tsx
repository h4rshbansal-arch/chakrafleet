import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobList } from "@/components/dashboard/job-list";
import { UserManagement } from "@/components/dashboard/user-management";
import { VehicleManagement } from "@/components/dashboard/vehicle-management";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Truck, FileText } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <AnalyticsCards />
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs"><Package className="mr-2 h-4 w-4" /> Job Requests</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> User Management</TabsTrigger>
          <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4" /> Vehicle Management</TabsTrigger>
          <TabsTrigger value="logs"><FileText className="mr-2 h-4 w-4" /> Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <JobList />
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
      </Tabs>
    </div>
  );
}
