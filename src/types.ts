/* Types copied from root project */

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  pendingApprovals: number;
  openPositions: number;
  payrollDueDate: string;
}

export type ActivityType = 'checkin' | 'checkout' | 'leave' | 'document' | 'update';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  employeeName: string;
  time: string;
  details: string;
  avatar?: string;
}

export type ApprovalType = 'leave' | 'overtime' | 'expense' | 'regularization';

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  employeeName: string;
  details: string;
  date: string;
  status: 'pending';
}

export interface DepartmentHeadcount {
  department: string;
  count: number;
  color: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'probation' | 'resigned';

export interface SalaryStructure {
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  pf: number;
  esi: number;
  professionalTax: number;
  tds: number;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface EmployeeDocument {
  type: string;
  status: 'uploaded' | 'pending' | 'verified';
  uploadedDate?: string;
  fileName?: string;
}

export interface EmployeeSummary {
  id: string;
  employeeId: string;
  fullName: string;
  avatar: string;
  designation: string;
  department: string;
  email: string;
  password?: string;
  phone?: string;
  status: EmployeeStatus;
  dateOfJoining: string;
  reportingManager: string;
  location: string;
  tags: string[];
  leaveBalance: number;
  salaryStructure?: SalaryStructure;
  bankDetails?: BankDetails;
  documents?: EmployeeDocument[];
}

export type EventType = 'company' | 'team' | 'training' | 'meeting' | 'holiday';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventPriority = 'normal' | 'important';
export type EventAudience = 'all' | 'selected' | 'department';
export type ParticipationStatus = 'interested' | 'attending';

export interface EventParticipation {
  employeeEmail: string;
  status: ParticipationStatus;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  location: string;
  audience: EventAudience;
  targetEmployeeIds: string[];
  targetDepartment?: string;
  status: EventStatus;
  priority: EventPriority;
  isPublished: boolean;
  attachments: { name: string; url: string }[];
  participations: EventParticipation[];
  createdAt: string;
}

export interface AttendanceRecord {
  employeeId: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  location?: string;
}

export type LeaveType = 'casual' | 'sick' | 'annual' | 'maternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  documents?: string[];
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'locked';
  totalEmployees: number;
  totalAmount: number;
  processedDate?: string;
}

export type PayslipStatus = 'sent' | 'pending' | 'viewed';

export interface PayslipData {
  id: string;
  employeeId: string;
  name: string;
  month: string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: PayslipStatus;
  remarks?: string;
  fileName?: string;
  fileUrl?: string;
  grossSalary: number;
  lop: number;
  attendanceSummary: {
    present: number;
    absent: number;
    totalDays: number;
  };
}

export type AdminNotificationType = 'global' | 'selected';
export type AdminNotificationPriority = 'normal' | 'high' | 'urgent';
export type AdminNotificationStatus = 'active' | 'inactive';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  targetEmployeeIds: string[];
  priority: AdminNotificationPriority;
  dateTime: string;
  status: AdminNotificationStatus;
  readBy: string[];
}

export interface CustomTeam {
  id: string;
  name: string;
  memberIds: string[];
  memberNames: string[];
  createdAt: string;
}

export type AssigneeType = 'employee' | 'department' | 'team';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assigneeName: string;
  assigneeType: AssigneeType;
  priority: TaskPriority;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface PerformanceCycle {
  id: string;
  name: string;
  period: string;
  status: 'draft' | 'active' | 'completed';
  participants: number;
  completed: number;
}

export interface GoalTracking {
  employeeId: string;
  name: string;
  goal: string;
  progress: number;
  deadline: string;
  status: 'on-track' | 'behind' | 'completed';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  // optional fields — not all backends populate the same keys
  action?: string;
  module?: string;
  entity?: string;
  // commonly used for filtering/summaries
  level?: string;
  message?: string;
  // details can be string or structured data
  details?: any;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
} 
