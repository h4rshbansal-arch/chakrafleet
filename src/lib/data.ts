import type { User, Vehicle, Job, ActivityLog, UserRole } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const users: User[] = [];

export const vehicles: Vehicle[] = [];

export const jobs: Job[] = [];

export const activityLogs: ActivityLog[] = [];

export const historicalJobData = jobs.filter(job => job.status === 'Completed').map(job => ({
    jobId: job.id,
    driverId: job.driverId!,
    vehicleId: job.vehicleId!,
    jobDescription: job.description,
}));
