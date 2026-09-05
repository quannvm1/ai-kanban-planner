'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, ActiveView } from '@/components/layout/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CalendarView } from '@/components/views/CalendarView';
import { ListView } from '@/components/views/ListView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { TagsView } from '@/components/views/TagsView';
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal';
import { TaskDetailModal } from '@/components/kanban/TaskDetailModal';
import { DailyPlannerModal } from '@/components/planner/DailyPlannerModal';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { BoardDto, Priority, TaskDto } from '@ai-kanban/shared-types';
import { apiClient } from '@/lib/api-client';
import {
  Sparkles,
  Plus,
  Layers,
  Search,
  Maximize2,
  Columns,
  Star,
  Tag,
  Filter,
} from 'lucide-react';

// Fallback initial board data for immediate rendering
const INITIAL_DEMO_BOARD: BoardDto = {
  id: 'board-default',
  userId: 'user-default',
  title: 'Bảng Công Việc Cá Nhân',
  description: 'Theo dõi tiến độ, Pomodoro và lập kế hoạch AI hàng ngày',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  columns: [
    {
      id: 'col-backlog',
      boardId: 'board-default',
      title: 'Backlog',
      orderIndex: 0,
      colorHex: '#64748b',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-1',
          boardId: 'board-default',
          columnId: 'col-backlog',
          title: 'Nghiên cứu Dockerize NestJS Multi-stage Build',
          description: 'Tối ưu image size bằng Alpine Linux',
          priority: Priority.LOW,
          orderIndex: 0,
          estimatedMins: 45,
          spentMins: 0,
          isCompleted: false,
          isMandatory: false,
          tags: ['Docker', 'DevOps'],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'col-todo',
      boardId: 'board-default',
      title: 'To Do',
      orderIndex: 1,
      colorHex: '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-daily-1',
          boardId: 'board-default',
          columnId: 'col-todo',
          title: 'Học tiếng Anh: Luyện nói 30p với ChatGPT',
          description: 'Chủ đề: Daily Routine & Software Architecture',
          priority: Priority.HIGH,
          orderIndex: 0,
          estimatedMins: 30,
          spentMins: 0,
          isCompleted: false,
          isMandatory: true,
          tags: ['Study', 'English', 'Daily'],
          subtasks: [
            { id: 's01', title: 'Luyện phát âm 10 từ vựng chuyên ngành', isDone: true },
            { id: 's02', title: 'Hội thoại voice 15 phút với AI', isDone: false },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          boardId: 'board-default',
          columnId: 'col-todo',
          title: 'Xây dựng Strategy Pattern cho Gemini & OpenAI',
          description: 'Hỗ trợ switch model linh hoạt qua UI',
          priority: Priority.HIGH,
          orderIndex: 1,
          estimatedMins: 60,
          spentMins: 0,
          isCompleted: false,
          isMandatory: false,
          tags: ['AI', 'Pattern'],
          subtasks: [
            { id: 's1', title: 'Interface IAILLMStrategy', isDone: true },
            { id: 's2', title: 'Factory Provider Resolver', isDone: true },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'col-in-progress',
      boardId: 'board-default',
      title: 'In Progress',
      orderIndex: 2,
      wipLimit: 3,
      colorHex: '#f59e0b',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-3',
          boardId: 'board-default',
          columnId: 'col-in-progress',
          title: 'Tối ưu UI Kanban Board dnd-kit mượt mà',
          description: 'Optimistic UI updates và animations',
          priority: Priority.URGENT,
          orderIndex: 0,
          estimatedMins: 90,
          spentMins: 45,
          isCompleted: false,
          isMandatory: false,
          tags: ['Frontend', 'React'],
          subtasks: [
            { id: 's3', title: 'Drag Sensors setup', isDone: true },
            { id: 's4', title: 'Drop collisions', isDone: true },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'col-review',
      boardId: 'board-default',
      title: 'In Review',
      orderIndex: 3,
      wipLimit: 2,
      colorHex: '#8b5cf6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
    },
    {
      id: 'col-done',
      boardId: 'board-default',
      title: 'Done',
      orderIndex: 4,
      colorHex: '#10b981',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        {
          id: 'task-4',
          boardId: 'board-default',
          columnId: 'col-done',
          title: 'Hoàn thiện tài liệu SDLC & System Design',
          description: 'SRS, Clean Architecture, ERD, API Docs',
          priority: Priority.HIGH,
          orderIndex: 0,
          estimatedMins: 120,
          spentMins: 120,
          isCompleted: true,
          isMandatory: false,
          completedAt: new Date().toISOString(),
          tags: ['Docs', 'SDLC'],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
};

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'Tất cả ưu tiên', color: '#94a3b8' },
  {
    value: Priority.URGENT,
    label: 'Khẩn cấp',
    color: '#f43f5e',
    badge: (
      <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-300 rounded font-bold">
        Gấp
      </span>
    ),
  },
  { value: Priority.HIGH, label: 'Ưu tiên Cao', color: '#f59e0b' },
  { value: Priority.MEDIUM, label: 'Ưu tiên Vừa', color: '#3b82f6' },
  { value: Priority.LOW, label: 'Ưu tiên Thấp', color: '#64748b' },
];

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuthStore();
  const [board, setBoard] = useState<BoardDto>(INITIAL_DEMO_BOARD);
  const [activeView, setActiveView] = useState<ActiveView>('kanban');
  const [layoutMode, setLayoutMode] = useState<'fit' | 'scroll'>('fit');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<TaskDto | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showOnlyMandatory, setShowOnlyMandatory] = useState<boolean>(false);

  useEffect(() => {
    const viewParam = searchParams.get('view') as ActiveView | null;
    if (
      viewParam &&
      ['kanban', 'calendar', 'list', 'analytics', 'tags'].includes(viewParam)
    ) {
      setActiveView(viewParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadBoardData();
  }, [token]);

  const loadBoardData = async () => {
    try {
      const boards: any = await apiClient.get('/boards');
      if (Array.isArray(boards) && boards.length > 0) {
        const details: any = await apiClient.get(`/boards/${boards[0].id}`);
        setBoard(details);
      }
    } catch (e) {
      console.log('Using local starter board data');
    }
  };

  const handleOpenAddTask = (colId: string) => {
    setTargetColumnId(colId);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await apiClient.post('/tasks', taskData);
      loadBoardData();
    } catch (e) {
      // Fallback local update
      const newTask: TaskDto = {
        id: crypto.randomUUID(),
        boardId: board.id,
        columnId: taskData.columnId,
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority,
        orderIndex: 0,
        estimatedMins: taskData.estimatedMins,
        spentMins: 0,
        dueDate: taskData.dueDate || null,
        isCompleted: false,
        isMandatory: taskData.isMandatory || false,
        tags: taskData.tags || [],
        subtasks: (taskData.subtasks || []).map((s: any) => ({
          id: crypto.randomUUID(),
          title: s.title,
          isDone: false,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === taskData.columnId ? { ...c, tasks: [newTask, ...c.tasks] } : c,
        ),
      }));
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TaskDto>) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, updates);
      loadBoardData();
    } catch (e) {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        })),
      }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      loadBoardData();
    } catch (e) {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => ({
          ...c,
          tasks: c.tasks.filter((t) => t.id !== taskId),
        })),
      }));
    }
  };

  // Filtered board view
  const filteredBoard: BoardDto = {
    ...board,
    columns: board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const matchesSearch =
          !searchQuery.trim() ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        const matchesMandatory = !showOnlyMandatory || t.isMandatory;
        return matchesSearch && matchesPriority && matchesMandatory;
      }),
    })),
  };

  const mandatoryCount = board.columns.flatMap((c) => c.tasks).filter((t) => t.isMandatory).length;
  const distinctTagsCount = new Set(
    board.columns.flatMap((c) => c.tasks).flatMap((t) => t.tags || []),
  ).size;

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden transition-colors">
      <Navbar onOpenAIPlanner={() => setIsAIPlannerOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAIPlanner={() => setIsAIPlannerOpen(true)}
          onOpenSettings={() => router.push('/settings')}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/60 dark:bg-gradient-to-b dark:from-slate-950/40 dark:to-[#090D16]">
          {/* Board Subheader Toolbar - Added relative z-30 to prevent dropdown clipping */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white/70 dark:bg-slate-950/30 backdrop-blur-md relative z-30">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {board.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">{board.description}</p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Daily Mandatory Filter Button */}
              <button
                onClick={() => setShowOnlyMandatory(!showOnlyMandatory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showOnlyMandatory
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50'
                }`}
                title="Lọc các nhiệm vụ Daily bắt buộc"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    showOnlyMandatory ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>Daily Bắt Buộc</span>
                {mandatoryCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      showOnlyMandatory
                        ? 'bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {mandatoryCount}
                  </span>
                )}
              </button>

              {/* Tag Management Quick Button */}
              <button
                onClick={() => setActiveView('tags')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  activeView === 'tags'
                    ? 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50'
                }`}
                title="Mở bảng quản lý Tags chi tiết"
              >
                <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tags</span>
                {distinctTagsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {distinctTagsCount}
                  </span>
                )}
              </button>

              {/* Layout Mode Toggle (Fit screen vs Scroll) */}
              {activeView === 'kanban' && (
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 text-xs">
                  <button
                    onClick={() => setLayoutMode('fit')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                      layoutMode === 'fit'
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title="Hiển thị toàn bộ cột vừa vặn trên một màn hình không cần cuộn ngang"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Vừa màn hình</span>
                  </button>
                  <button
                    onClick={() => setLayoutMode('scroll')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                      layoutMode === 'scroll'
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title="Hiển thị cột kích thước rộng rãi với thanh cuộn ngang mượt mà"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rộng rãi</span>
                  </button>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm task, tag..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 w-36 sm:w-44 transition shadow-sm"
                />
              </div>

              {/* Priority Filter Custom Dropdown with elevated z-index */}
              <div className="w-36 sm:w-40 relative z-50">
                <CustomSelect
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(val)}
                  options={PRIORITY_OPTIONS}
                  size="sm"
                  triggerClassName="py-1.5 text-xs"
                />
              </div>

              <button
                onClick={() => handleOpenAddTask(board.columns[0]?.id || '')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Thêm Thẻ</span>
              </button>
            </div>
          </div>

          {/* View Render Area */}
          <div className="flex-1 p-3.5 sm:p-5 overflow-hidden">
            {activeView === 'kanban' && (
              <KanbanBoard
                board={filteredBoard}
                onTaskClick={(task) => setSelectedTask(task)}
                onAddTask={(colId) => handleOpenAddTask(colId)}
                onStartPomodoro={(task) => setPomodoroTask(task)}
                onRefresh={loadBoardData}
                layoutMode={layoutMode}
              />
            )}
            {activeView === 'calendar' && (
              <CalendarView
                board={filteredBoard}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            )}
            {activeView === 'list' && (
              <ListView
                board={filteredBoard}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            )}
            {activeView === 'tags' && (
              <TagsView
                board={board}
                onTaskClick={(task) => setSelectedTask(task)}
                onUpdateTask={handleUpdateTask}
              />
            )}
            {activeView === 'analytics' && <AnalyticsView board={board} />}
          </div>
        </main>
      </div>

      {/* Modals & Floating Widgets */}
      <CreateTaskModal
        boardId={board.id}
        columnId={targetColumnId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onStartPomodoro={(t) => setPomodoroTask(t)}
      />

      <DailyPlannerModal
        boardId={board.id}
        isOpen={isAIPlannerOpen}
        onClose={() => setIsAIPlannerOpen(false)}
        onApplied={loadBoardData}
      />

      <PomodoroWidget
        task={pomodoroTask}
        onClose={() => setPomodoroTask(null)}
        onFinished={loadBoardData}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#070B14]" />}>
      <DashboardPageContent />
    </React.Suspense>
  );
}
