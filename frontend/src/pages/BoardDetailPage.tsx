import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { boardService } from '../services/board';
import { taskService } from '../services/task';
import type { Column } from '../types/column';
import type { Task } from '../types/task';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import ColumnCard from '../components/columns/ColumnCard';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm, { type TaskFormValues } from '../components/tasks/TaskForm';
import TaskModal from '../components/tasks/TaskModal';

function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId!),
    enabled: !!boardId,
  });

  // Sync server state into local state (local copy is needed for smooth drag-and-drop)
  if (columns.length === 0 && board?.columns) {
    setColumns(board.columns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // so plain clicks still open the modal
    }),
  );

  const createColumnMutation = useMutation({
    mutationFn: (title: string) =>
      boardService.createColumn(boardId!, {
        title,
        position: (board?.columns?.length || 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setShowCreateColumn(false);
      setColumnTitle('');
      toast.success('Column created!');
    },
    onError: () => toast.error('Failed to create column'),
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) =>
      boardService.deleteColumn(boardId!, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('Column deleted!');
    },
    onError: () => toast.error('Failed to delete column'),
  });

  const createTaskMutation = useMutation({
    mutationFn: ({
      columnId,
      values,
    }: {
      columnId: string;
      values: TaskFormValues;
    }) =>
      taskService.createTask(columnId, {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority || undefined,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setCreateTaskColumnId(null);
      toast.success('Task created!');
    },
    onError: () => toast.error('Failed to create task'),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({
      sourceColumnId,
      taskId,
      newColumnId,
      position,
    }: {
      sourceColumnId: string;
      taskId: string;
      newColumnId: string;
      position: number;
    }) =>
      taskService.moveTask(sourceColumnId, taskId, { newColumnId, position }),
    onError: () => {
      toast.error('Failed to move task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) {
      toast.error('Column title required');
      return;
    }
    createColumnMutation.mutate(columnTitle);
  };

  // ---------- Drag-and-drop handlers ----------

  const findColumnByTaskId = (taskId: string) =>
    columns.find((col) => col.tasks?.some((t) => t.id === taskId));

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns
      .flatMap((c) => c.tasks || [])
      .find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  // Fires while dragging over another column: move task between columns in local state
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColumn = findColumnByTaskId(activeId);
    // over can be a task OR an empty column
    const targetColumn =
      columns.find((c) => c.id === overId) ?? findColumnByTaskId(overId);

    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id)
      return;

    setColumns((prev) => {
      const task = sourceColumn.tasks.find((t) => t.id === activeId);
      if (!task) return prev;

      const overTaskIndex = targetColumn.tasks.findIndex(
        (t) => t.id === overId,
      );
      const insertIndex =
        overTaskIndex >= 0 ? overTaskIndex : targetColumn.tasks.length;

      return prev.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === targetColumn.id) {
          const newTasks = [...col.tasks];
          newTasks.splice(insertIndex, 0, { ...task, columnId: col.id });
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const column = findColumnByTaskId(activeId);
    if (!column) return;

    const oldIndex = column.tasks.findIndex((t) => t.id === activeId);
    const overIndex = column.tasks.findIndex((t) => t.id === overId);

    let finalIndex = oldIndex;

    // Reorder within the same column
    if (overIndex >= 0 && oldIndex !== overIndex) {
      finalIndex = overIndex;
      setColumns((prev) =>
        prev.map((col) =>
          col.id === column.id
            ? { ...col, tasks: arrayMove(col.tasks, oldIndex, overIndex) }
            : col,
        ),
      );
    }

    // Persist to backend. The original columnId comes from the server data.
    const originalColumnId =
      board?.columns
        .flatMap((c) => c.tasks || [])
        .find((t) => t.id === activeId)?.columnId ?? column.id;

    moveTaskMutation.mutate({
      sourceColumnId: originalColumnId,
      taskId: activeId,
      newColumnId: column.id,
      position: finalIndex + 1,
    });
  };

  // ---------- Derived state for modals ----------

  const selectedTask = columns
    .flatMap((c) => c.tasks || [])
    .find((t) => t.id === selectedTaskId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">{board?.title}</h1>
        <p className="text-gray-600 mb-8">{board?.description}</p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex overflow-x-auto gap-4 pb-4">
            {columns.map((column) => (
              <ColumnCard
                key={column.id}
                column={column}
                onDelete={(id) => deleteColumnMutation.mutate(id)}
                onTaskClick={(taskId) => setSelectedTaskId(taskId)}
                onAddTask={(columnId) => setCreateTaskColumnId(columnId)}
              />
            ))}

            {!showCreateColumn ? (
              <button
                onClick={() => setShowCreateColumn(true)}
                className="flex items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap h-fit"
              >
                <Plus className="w-5 h-5" />
                Add Column
              </button>
            ) : (
              <div className="bg-white rounded-lg p-4 shadow-sm w-80 shrink-0">
                <form onSubmit={handleCreateColumn} className="space-y-2">
                  <input
                    type="text"
                    value={columnTitle}
                    onChange={(e) => setColumnTitle(e.target.value)}
                    placeholder="Column title"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createColumnMutation.isPending}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                    >
                      {createColumnMutation.isPending ? '...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateColumn(false)}
                      className="flex-1 border rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create task modal */}
      {createTaskColumnId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setCreateTaskColumnId(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New task</h3>
              <button
                onClick={() => setCreateTaskColumnId(null)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <TaskForm
              onSubmit={(values) =>
                createTaskMutation.mutate({
                  columnId: createTaskColumnId,
                  values,
                })
              }
              onCancel={() => setCreateTaskColumnId(null)}
              isPending={createTaskMutation.isPending}
              submitLabel="Create task"
            />
          </div>
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && board && (
        <TaskModal
          task={selectedTask}
          board={board}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

export default BoardDetailPage;
