'use client';

import React, { useState, useEffect } from 'react';
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

interface KanbanBoardProps {
  board: BoardDto;
  onTaskClick: (task: TaskDto) => void;
  onAddTask: (columnId: string) => void;
  onStartPomodoro?: (task: TaskDto) => void;
  onRefresh?: () => void;
}

export function KanbanBoard({
  board,
  onTaskClick,
  onAddTask,
  onStartPomodoro,
  onRefresh,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnDto[]>(board.columns || []);
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 h-full scroll-smooth">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={col.tasks || []}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onStartPomodoro={onStartPomodoro}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
