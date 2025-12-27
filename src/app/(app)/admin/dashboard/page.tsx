"use client";

import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobList } from "@/components/dashboard/job-list";
import { UserManagement } from "@/components/dashboard/user-management";
import { VehicleManagement } from "@/components/dashboard/vehicle-management";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Truck, FileText, PlusCircle, Archive, Settings, FileDown } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context";
import { JobCreationForm } from "@/components/dashboard/job-creation-form";
import { Settings as SettingsComponent } from "@/components/dashboard/settings";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNavBar } from "@/components/shared/bottom-nav-bar";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { Job, User } from '@/lib/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

function AdminDashboardContent() {
  const { activeTab, setActiveTab } = useDashboard();
  const isMobile = useIsMobile();
  const firestore = useFirestore();

  const pendingQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Pending')), [firestore]);
  const approvedQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Approved')), [firestore]);
  const completedQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Completed')), [firestore]);
  const driversQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '==', 'Driver'), where('availability', '==', true)), [firestore]);

  const { data: pendingJobs } = useCollection<Job>(pendingQuery);
  const { data: approvedJobs } = useCollection<Job>(approvedQuery);
  const { data: completedJobs } = useCollection<Job>(completedQuery);
  const { data: activeDrivers } = useCollection<User>(driversQuery);

  const dashboardTabs = [
    { value: "jobs", icon: Package, label: "Job Requests" },
    { value: "create-job", icon: PlusCircle, label: "Create Job" },
    { value: "archived", icon: Archive, label: "Archived Jobs" },
    { value: "users", icon: Users, label: "User Management" },
    { value: "vehicles", icon: Truck, label: "Vehicle Management" },
    { value: "logs", icon: FileText, label: "Activity Log" },
    { value: "settings", icon: Settings, label: "Settings" },
  ];

  const handleExport = () => {
    const data = [
      { Statistic: "Pending Jobs", Value: pendingJobs?.length ?? 0 },
      { Statistic: "Approved Jobs", Value: approvedJobs?.length ?? 0 },
      { Statistic: "Active Drivers", Value: activeDrivers?.length ?? 0 },
      { Statistic: "Completed Jobs", Value: completedJobs?.length ?? 0 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Stats");

    // Set column widths
    worksheet['!cols'] = [{ wch: 20 }, { wch: 10 }];
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    XLSX.writeFile(workbook, `ChakraFleet_Stats_${timestamp}.xlsx`);
  }

  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleExport} variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      <AnalyticsCards />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {!isMobile && (
           <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
            {dashboardTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
       
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
      {isMobile && <BottomNavBar tabs={dashboardTabs} />}
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
