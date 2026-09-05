'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { BoardDto, ColumnDto, TaskDto } from '@ai-kanban/shared-types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { apiClient } from '@/lib/api-client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanBoardProps {
  board: BoardDto;
  onTaskClick: (task: TaskDto) => void;
  onAddTask: (columnId: string) => void;
  onStartPomodoro?: (task: TaskDto) => void;
  onRefresh?: () => void;
  layoutMode?: 'fit' | 'scroll';
}

export function KanbanBoard({
  board,
  onTaskClick,
  onAddTask,
  onStartPomodoro,
  onRefresh,
  layoutMode = 'fit',
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnDto[]>(board.columns || []);
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColumns(board.columns || []);
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnOfTask = (taskId: string) => {
    return columns.find((col) => col.tasks?.some((t) => t.id === taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as TaskDto;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnOfTask(activeId);
    const overCol =
      findColumnOfTask(overId) || columns.find((c) => c.id === overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setColumns((prevCols) => {
      const activeTaskItem = activeCol.tasks.find((t) => t.id === activeId);
      if (!activeTaskItem) return prevCols;

      return prevCols.map((c) => {
        if (c.id === activeCol.id) {
          return { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) };
        }
        if (c.id === overCol.id) {
          const overIndex = c.tasks.findIndex((t) => t.id === overId);
          const newIndex = overIndex >= 0 ? overIndex : c.tasks.length;
          const updatedTask = { ...activeTaskItem, columnId: overCol.id };
          const newTasks = [...c.tasks];
          newTasks.splice(newIndex, 0, updatedTask);
          return { ...c, tasks: newTasks };
        }
        return c;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentCol = findColumnOfTask(activeId);
    if (!currentCol) return;

    const activeIndex = currentCol.tasks.findIndex((t) => t.id === activeId);
    const overIndex = currentCol.tasks.findIndex((t) => t.id === overId);

    if (activeIndex !== overIndex && overIndex >= 0) {
      setColumns((prevCols) =>
        prevCols.map((c) => {
          if (c.id === currentCol.id) {
            return {
              ...c,
              tasks: arrayMove(c.tasks, activeIndex, overIndex),
            };
          }
          return c;
        }),
      );
    }

    // Call Backend API to sync move
    try {
      await apiClient.patch(`/tasks/${activeId}/move`, {
        targetColumnId: currentCol.id,
        newOrderIndex: overIndex >= 0 ? overIndex : 0,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to sync task move with server', err);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full flex flex-col group/board">
        {/* Columns Grid / Flex Container */}
        <div
          ref={scrollContainerRef}
          className={`h-full pb-2 scroll-smooth custom-scrollbar ${
            layoutMode === 'fit'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-y-auto lg:overflow-y-hidden lg:overflow-x-hidden'
              : 'flex gap-4 overflow-x-auto'
          }`}
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={col.tasks || []}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
              onStartPomodoro={onStartPomodoro}
              layoutMode={layoutMode}
            />
          ))}
        </div>

        {/* Scroll Left/Right floating controls for scroll mode */}
        {layoutMode === 'scroll' && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-indigo-600 shadow-xl flex items-center justify-center opacity-0 group-hover/board:opacity-90 transition-all z-20"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-indigo-600 shadow-xl flex items-center justify-center opacity-0 group-hover/board:opacity-90 transition-all z-20"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500 rounded-xl cursor-grabbing">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
