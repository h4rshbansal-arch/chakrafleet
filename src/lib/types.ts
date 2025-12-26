import { type Timestamp } from 'firebase/firestore';

export type UserRole = 'Admin' | 'Supervisor' | 'Driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  availability?: boolean;
  currentLocation?: string;
  pastJobs?: string[];
}

export type VehicleStatus = 'available' | 'in-use' | 'maintenance';

export interface Vehicle {
  id: string;
  name: string;
  type: 'Truck' | 'Van' | 'Motorcycle';
  capacity: string;
  status: VehicleStatus;
  location: string;
}

export type JobStatus = 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';

export interface Job {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  date: string; // Consider using Timestamp for Firestore
  status: JobStatus;
  driverId?: string;
  vehicleId?: string;
  supervisorId: string;
  requestDate?: Timestamp;
  pickupTime?: Timestamp;
}

export interface ActivityLog {
  id: string;
  timestamp: Timestamp;
  userId: string;
  activityType: string;
  description: string;
}
