// User & Auth
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// Kanban Task & Board Enums
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AIProviderType {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  CLAUDE = 'CLAUDE',
  DEEPSEEK = 'DEEPSEEK',
}

// Data Entities & DTOs
export interface SubtaskDto {
  id?: string;
  title: string;
  isDone?: boolean;
  orderIndex?: number;
}

export interface TaskDto {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string | null;
  priority: Priority;
  orderIndex: number;
  dueDate?: string | null;
  estimatedMins?: number | null;
  spentMins?: number | null;
  isCompleted: boolean;
  completedAt?: string | null;
  tags: string[];
  subtasks: SubtaskDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnDto {
  id: string;
  boardId: string;
  title: string;
  orderIndex: number;
  wipLimit?: number | null;
  colorHex?: string | null;
  tasks: TaskDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardDto {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  columns: ColumnDto[];
  createdAt: string;
  updatedAt: string;
}

// Activity Logging
export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_MOVED'
  | 'TASK_COMPLETED'
  | 'POMODORO_COMPLETED'
  | 'DAILY_JOURNAL_SAVED';

export interface ActivityLogDto {
  id: string;
  userId: string;
  taskId?: string | null;
  action: ActivityAction;
  details?: Record<string, any> | null;
  recordedAt: string;
}

// AI Daily Collector & Next-Day Planner
export interface DailySummaryContext {
  date: string;
  completedTasksCount: number;
  totalSpentMins: number;
  completedTasks: Array<{
    id: string;
    title: string;
    spentMins: number;
    tags: string[];
  }>;
  inProgressTasks: Array<{
    id: string;
    title: string;
    estimatedMins: number;
    spentMins: number;
  }>;
  todayJournal?: string | null;
}

export interface SuggestedTaskProposal {
  id?: string;
  title: string;
  description?: string;
  priority: Priority;
  estimatedMins: number;
  suggestedColumn: string;
  subtasks?: string[];
  isApplied?: boolean;
}

export interface DailyPlanProposal {
  dailyPlanId?: string;
  providerUsed: AIProviderType;
  summaryInsights: string;
  suggestedTasks: SuggestedTaskProposal[];
}

export interface UserApiKeyMasked {
  provider: AIProviderType;
  maskedKey: string;
  isActive: boolean;
  updatedAt: string;
}

// Standard API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  timestamp: string;
}
