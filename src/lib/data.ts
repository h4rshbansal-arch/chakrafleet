import type { User, Vehicle, Job, ActivityLog, UserRole } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const users: User[] = [
  { id: 'user-001', name: 'Admin User', email: 'admin@eztransport.com', role: 'Admin', avatarUrl: PlaceHolderImages.find(p => p.id === 'user1')?.imageUrl || '' },
  { id: 'user-002', name: 'Supervisor Sam', email: 'supervisor.sam@eztransport.com', role: 'Supervisor', avatarUrl: PlaceHolderImages.find(p => p.id === 'user2')?.imageUrl || '' },
  { id: 'user-003', name: 'Driver Dave', email: 'driver.dave@eztransport.com', role: 'Driver', avatarUrl: PlaceHolderImages.find(p => p.id === 'user3')?.imageUrl || '', availability: true, currentLocation: 'Warehouse A, NYC', pastJobs: ['job-001', 'job-003'] },
  { id: 'user-004', name: 'Driver Daisy', email: 'driver.daisy@eztransport.com', role: 'Driver', avatarUrl: PlaceHolderImages.find(p => p.id === 'user4')?.imageUrl || '', availability: false, currentLocation: 'On Route, NJ' },
  { id: 'user-005', name: 'Driver Dan', email: 'driver.dan@eztransport.com', role: 'Driver', avatarUrl: PlaceHolderImages.find(p => p.id === 'user5')?.imageUrl || '', availability: true, currentLocation: 'Depot B, Brooklyn' },
];

export const vehicles: Vehicle[] = [
  { id: 'vehicle-001', name: 'Truck-A1', type: 'Truck', capacity: '10 tons', status: 'available', location: 'Warehouse A, NYC' },
  { id: 'vehicle-002', name: 'Van-B2', type: 'Van', capacity: '2 tons', status: 'in-use', location: 'On Route to Boston' },
  { id: 'vehicle-003', name: 'Moto-C3', type: 'Motorcycle', capacity: '50 kg', status: 'maintenance', location: 'Garage, Queens' },
  { id: 'vehicle-004', name: 'Truck-D4', type: 'Truck', capacity: '15 tons', status: 'available', location: 'Depot B, Brooklyn' },
  { id: 'vehicle-005', name: 'Van-E5', type: 'Van', capacity: '2.5 tons', status: 'available', location: 'Warehouse A, NYC' },
];

export const jobs: Job[] = [
  { id: 'job-001', title: 'Electronics Delivery', description: 'Deliver 50 boxes of electronics to Best Buy.', origin: 'Warehouse A, NYC', destination: 'Best Buy, Manhattan', date: '2024-08-15', status: 'Completed', driverId: 'user-003', vehicleId: 'vehicle-001', supervisorId: 'user-002' },
  { id: 'job-002', title: 'Urgent Document Transfer', description: 'Deliver legal documents to law firm.', origin: 'Office, Midtown', destination: 'Law Firm, Downtown', date: '2024-08-16', status: 'In Progress', driverId: 'user-004', vehicleId: 'vehicle-002', supervisorId: 'user-002' },
  { id: 'job-003', title: 'Medical Supplies', description: 'Transport medical supplies to hospital.', origin: 'Depot B, Brooklyn', destination: 'Brooklyn Hospital', date: '2024-08-17', status: 'Approved', driverId: 'user-003', vehicleId: 'vehicle-004', supervisorId: 'user-002' },
  { id: 'job-004', title: 'Fresh Produce Shipment', description: 'Transport fresh vegetables to a supermarket. Requires refrigerated truck.', origin: 'Farm, Upstate NY', destination: 'Whole Foods, Union Square', date: '2024-08-18', status: 'Pending', supervisorId: 'user-002' },
  { id: 'job-005', title: 'Furniture Move', description: 'Move office furniture to a new location.', origin: 'Old Office, Financial District', destination: 'New Office, Hudson Yards', date: '2024-08-20', status: 'Pending', supervisorId: 'user-002' },
  { id: 'job-006', title: 'Construction Material Haul', description: 'Heavy duty transport of steel beams.', origin: 'Port of New York', destination: 'Construction Site, Queens', date: '2024-08-19', status: 'Rejected', supervisorId: 'user-002' },
];

export const activityLogs: ActivityLog[] = [
  { id: 'log-001', timestamp: '2024-08-15 10:00 AM', user: 'Supervisor Sam', action: 'Created Job', details: 'Job #job-002' },
  { id: 'log-002', timestamp: '2024-08-15 10:05 AM', user: 'Admin User', action: 'Approved Job', details: 'Job #job-002' },
  { id: 'log-003', timestamp: '2024-08-15 10:10 AM', user: 'Admin User', action: 'Assigned Driver', details: 'Driver Dave to Job #job-002' },
  { id: 'log-004', timestamp: '2024-08-15 11:00 AM', user: 'Driver Dave', action: 'Updated Status', details: 'Job #job-002 to In Progress' },
  { id: 'log-005', timestamp: '2024-08-16 09:00 AM', user: 'Admin User', action: 'Added Vehicle', details: 'Vehicle #vehicle-004' },
];

export const historicalJobData = jobs.filter(job => job.status === 'Completed').map(job => ({
    jobId: job.id,
    driverId: job.driverId!,
    vehicleId: job.vehicleId!,
    jobDescription: job.description,
}));
