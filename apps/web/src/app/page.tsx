'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, ActiveView } from '@/components/layout/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CalendarView } from '@/components/views/CalendarView';
import { ListView } from '@/components/views/ListView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal';
import { TaskDetailModal } from '@/components/kanban/TaskDetailModal';
import { DailyPlannerModal } from '@/components/planner/DailyPlannerModal';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { BoardDto, Priority, TaskDto } from '@ai-kanban/shared-types';
import { apiClient } from '@/lib/api-client';
import { Sparkles, Plus, Layers, Filter, Search } from 'lucide-react';

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
          id: 'task-2',
          boardId: 'board-default',
          columnId: 'col-todo',
          title: 'Xây dựng Strategy Pattern cho Gemini & OpenAI',
          description: 'Hỗ trợ switch model linh hoạt qua UI',
          priority: Priority.HIGH,
          orderIndex: 0,
          estimatedMins: 60,
          spentMins: 0,
          isCompleted: false,
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [board, setBoard] = useState<BoardDto>(INITIAL_DEMO_BOARD);
  const [activeView, setActiveView] = useState<ActiveView>('kanban');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<TaskDto | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

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
        return matchesSearch && matchesPriority;
      }),
    })),
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col">
      <Navbar onOpenAIPlanner={() => setIsAIPlannerOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAIPlanner={() => setIsAIPlannerOpen(true)}
          onOpenSettings={() => router.push('/settings')}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-950/40 to-[#090D16]">
          {/* Board Subheader Toolbar */}
          <div className="px-6 py-3.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {board.title}
              </h2>
              <p className="text-[11px] text-slate-400">{board.description}</p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm task, tag..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 w-44"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="ALL">Tất cả ưu tiên</option>
                <option value={Priority.URGENT}>Khẩn cấp</option>
                <option value={Priority.HIGH}>Cao</option>
                <option value={Priority.MEDIUM}>Trung bình</option>
                <option value={Priority.LOW}>Thấp</option>
              </select>

              <button
                onClick={() => handleOpenAddTask(board.columns[0]?.id || '')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thẻ</span>
              </button>
            </div>
          </div>

          {/* View Render Area */}
          <div className="flex-1 p-6 overflow-hidden">
            {activeView === 'kanban' && (
              <KanbanBoard
                board={filteredBoard}
                onTaskClick={(task) => setSelectedTask(task)}
                onAddTask={(colId) => handleOpenAddTask(colId)}
                onStartPomodoro={(task) => setPomodoroTask(task)}
                onRefresh={loadBoardData}
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
