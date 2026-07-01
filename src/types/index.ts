export type UserRole = 'Manager' | 'User';

export type TransactionType = 'Income' | 'Expense';

export type ApprovalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedBranches: string[];
  isActive?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive?: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  url: string;
  contentType?: string;
  size?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string; // ISO date
  branchId: string;
  branchName?: string;
  userId: string;
  userName?: string;
  status: ApprovalStatus;
  reference?: string;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string;
  branchId: string;
  reference?: string;
  attachmentIds?: string[];
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  branch?: string;
  userId?: string;
  from?: string;
  to?: string;
  status?: ApprovalStatus;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MonthlySeriesPoint {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategorySlice {
  category: string;
  amount: number;
  count: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  pendingApprovals: number;
  monthlySeries: MonthlySeriesPoint[];
  topCategories: CategorySlice[];
  recent: Transaction[];
}

export interface ReportFilters {
  from?: string;
  to?: string;
  category?: string;
  userId?: string;
  branch?: string;
}

export type ReportPeriod = 'daily' | 'monthly' | 'yearly';

export interface ReportRow {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportResult {
  rows: ReportRow[];
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export type ExportFormat = 'excel' | 'pdf' | 'csv';

export interface UserInput {
  email: string;
  displayName: string;
  role: UserRole;
  assignedBranches: string[];
  password?: string;
  isActive?: boolean;
}

export interface BranchInput {
  name: string;
  code: string;
  address?: string;
  isActive?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
