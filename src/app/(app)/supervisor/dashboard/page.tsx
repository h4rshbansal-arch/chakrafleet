import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobCreationForm } from "@/components/dashboard/job-creation-form";
import { JobList } from "@/components/dashboard/job-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SupervisorDashboard() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <AnalyticsCards />
        <Card>
          <CardHeader>
            <CardTitle>My Job Requests</CardTitle>
            <CardDescription>A list of jobs you have created.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobList />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <JobCreationForm />
      </div>
    </div>
  );
}
