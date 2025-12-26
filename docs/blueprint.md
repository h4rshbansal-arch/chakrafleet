# **App Name**: EZTransport

## Core Features:

- Authentication: Firebase Authentication for secure role-based access (Admin, Supervisor, Driver).
- Admin Dashboard: Admin panel for managing transport jobs, drivers, supervisors, and vehicles. Includes job request approval/rejection, user and vehicle management, and activity logs.
- Supervisor Dashboard: Supervisor panel for creating and managing job requests. Includes job status updates and notifications.
- Driver Dashboard: Driver panel to view approved jobs, update job progress, and view job history.
- Job Management: Create, view, update, and archive transport jobs. Enforces business rules such as vehicle availability.
- Realtime Job Assigment Intelligence: An AI tool which suggests to admins the best matching drivers and vehicles for any new transport job. Criteria includes driver availability, vehicle status, location and historic data of previously served similar requests. Provides a reason for the match.
- Reporting & Analytics: Dashboard analytics displaying pending jobs, approved jobs, active drivers, and completed jobs.
- Language Support: English and Hindi language support with dynamic text changes via a toggle button.
- Notifications: Real-time notifications for job approval, rejection, and assignment.
- Firestore Integration: Store users, jobs, vehicles and logs in Firestore.

## Style Guidelines:

- Primary color: Dark Blue (#224293), evoking trust, security, and reliability which are essential for transport management.
- Background color: Very light gray (#F0F2F5), which maintains a professional and clean look while providing sufficient contrast.
- Accent color: Orange (#D97706), used sparingly to highlight interactive elements and important notifications, ensuring they grab attention without overwhelming the user.
- Body font: 'PT Sans', sans-serif font for a modern and readable interface. Headline font: 'Space Grotesk' to give off a technical vibe, suggesting scientific precision.
- Consistent use of flat, modern icons to represent different functionalities (e.g., users, vehicles, jobs).
- Clean and professional layout with clear sections for dashboards, forms, and data tables. Responsive design to adapt to different screen sizes.
- Subtle animations for transitions and feedback to enhance user experience (e.g., loading spinners, notification animations).