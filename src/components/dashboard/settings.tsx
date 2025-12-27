"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Settings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Manage your application settings here. More options coming soon.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No settings available yet.</p>
            </CardContent>
        </Card>
    )
}
