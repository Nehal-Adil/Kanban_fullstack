import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, X } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Board } from '../../types/board';
import { taskService } from '../../services/task';
import TaskForm, { type TaskFormValues } from './TaskForm';
import AssignmentSection from './AssignmentSection';

interface TaskModalProps {
  task: Task;
  board: Board;
  onClose: () => void;
}

function TaskModal({ task, board, onClose }: TaskModalProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (values: TaskFormValues) =>
      taskService.updateTask(task.columnId, task.id, {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority || undefined,
        dueDate: values.dueDate
          ? new Date(values.dueDate).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('Task updated!');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.deleteTask(task.columnId, task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('Task deleted');
      onClose();
    },
    onError: () => toast.error('Failed to delete task'),
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Task details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <TaskForm
          defaultValues={{
            title: task.title,
            description: task.description ?? '',
            priority: (task.priority as 'low' | 'medium' | 'high') ?? '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
          }}
          onSubmit={(values) => updateMutation.mutate(values)}
          isPending={updateMutation.isPending}
          submitLabel="Update task"
        />

        <hr className="my-5" />

        <AssignmentSection task={task} board={board} />

        <hr className="my-5" />

        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="flex items-center justify-center gap-2 w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete task'}
        </button>
      </div>
    </div>
  );
}

export default TaskModal;
