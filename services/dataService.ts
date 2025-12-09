import { LogEntry, User, Role, ApprovalStatus } from '../types';
import { supabase } from './supabase';

// Map Supabase 'logs' table rows to LogEntry
const mapLogFromDB = (data: any): LogEntry => ({
  id: data.id,
  teacherId: data.teacher_id,
  teacherName: data.teacher_name,
  date: data.date,
  period: data.period,
  activityType: data.activity_type,
  description: data.description,
  status: data.status,
  feedback: data.feedback,
  timestamp: Number(data.timestamp)
});

// Map LogEntry to Supabase 'logs' table row
const mapLogToDB = (log: LogEntry) => ({
  id: log.id,
  teacher_id: log.teacherId,
  teacher_name: log.teacherName,
  date: log.date,
  period: log.period,
  activity_type: log.activityType,
  description: log.description,
  status: log.status,
  feedback: log.feedback,
  timestamp: log.timestamp
});

// Map Supabase 'users' table rows to User
const mapUserFromDB = (data: any): User => ({
  id: data.id,
  name: data.name,
  role: data.role as Role,
  email: data.email,
  avatar: data.avatar,
  subjects: data.subjects,
  classes: data.classes,
  bio: data.bio,
  experience: data.experience
});

export const getLogs = async (): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from('logs')
    .select('*');
  
  if (error) {
    console.error("Error fetching logs from Supabase:", error);
    return [];
  }
  return data ? data.map(mapLogFromDB) : [];
};

export const saveLog = async (log: LogEntry): Promise<void> => {
  const { error } = await supabase
    .from('logs')
    .insert([mapLogToDB(log)]);
    
  if (error) {
    console.error("Error saving log to Supabase:", error);
  }
};

export const updateLogStatus = async (logId: string, status: ApprovalStatus, feedback?: string): Promise<void> => {
  const updateData: any = { status };
  if (feedback !== undefined) updateData.feedback = feedback;

  const { error } = await supabase
    .from('logs')
    .update(updateData)
    .eq('id', logId);

  if (error) {
    console.error("Error updating log status in Supabase:", error);
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email) // Case insensitive match
    .single();

  if (error) {
    // It's common to not find a user during login check, so we don't always error log widely
    if (error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
        console.error("Error fetching user from Supabase:", error);
    }
    return null;
  }
  return data ? mapUserFromDB(data) : null;
};

export const registerUserLocal = async (user: Omit<User, 'id'>): Promise<User> => {
  // Check if user exists first to avoid duplicates or errors
  const existing = await getUserByEmail(user.email);
  if (existing) {
    return existing;
  }

  const newUser = { ...user, id: crypto.randomUUID() };
  
  const { error } = await supabase
    .from('users')
    .insert([{
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      subjects: newUser.subjects,
      classes: newUser.classes,
      bio: newUser.bio,
      experience: newUser.experience
    }]);

  if (error) {
    console.error("Error creating user in Supabase:", error);
    throw new Error("Failed to create user profile in database.");
  }
  
  return newUser;
};

export const updateUser = async (updatedUser: User): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({
      name: updatedUser.name,
      role: updatedUser.role,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      subjects: updatedUser.subjects,
      classes: updatedUser.classes,
      bio: updatedUser.bio,
      experience: updatedUser.experience
    })
    .eq('id', updatedUser.id);

  if (error) {
    console.error("Error updating user in Supabase:", error);
  }
};

export const exportToCSV = async (): Promise<void> => {
  const logs = await getLogs();
  const headers = ['ID', 'Date (IST)', 'Teacher', 'Period', 'Activity', 'Description', 'Status', 'Feedback'];
  
  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    `"${log.teacherName}"`,
    `"${log.period}"`,
    `"${log.activityType}"`,
    `"${log.description.replace(/"/g, '""')}"`,
    log.status,
    `"${(log.feedback || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `school_logs_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};