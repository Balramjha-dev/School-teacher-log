export enum Role {
  TEACHER = 'TEACHER',
  PRINCIPAL = 'PRINCIPAL',
  OFFICIAL = 'OFFICIAL',
  OTHER = 'OTHER'
}

export enum ActivityType {
  CLASS = 'Class',
  OFFICE_WORK = 'Office Work',
  FREE_PERIOD = 'Free Period (Not Used)',
  PROXY = 'Proxy Class',
  OTHER = 'Something Else'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string; // Optional for legacy data, required for new
  avatar?: string; // Base64 string for profile photo
  subjects?: string;
  classes?: string;
  bio?: string;
  experience?: number;
}

export interface LogEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // ISO Date string
  period: string;
  activityType: ActivityType;
  description: string;
  status: ApprovalStatus;
  feedback?: string;
  timestamp: number;
}

export const PERIODS = [
  "Period 1 (08:00 - 09:00)",
  "Period 2 (09:00 - 10:00)",
  "Period 3 (10:15 - 11:15)",
  "Period 4 (11:15 - 12:15)",
  "Lunch Break",
  "Period 5 (13:00 - 14:00)",
  "Period 6 (14:00 - 15:00)"
];