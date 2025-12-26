import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { JobList } from "@/components/dashboard/job-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DriverDashboard() {
  return (
    <div className="space-y-8">
      <AnalyticsCards />
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Jobs</CardTitle>
          <CardDescription>
            Here are the jobs assigned to you. Please update the status as you progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobList />
        </CardContent>
      </Card>
    </div>
  );
}
