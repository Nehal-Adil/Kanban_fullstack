import { X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/task';
import toast from 'react-hot-toast';
import type { Task } from '../../types/task';
import type { User } from '../../types/auth';

interface TaskDetailProps {
  task: Task;
  boardMembers: User[];
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetail({
  task,
  boardMembers,
  columnId,
  isOpen,
  onClose,
}: TaskDetailProps) {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: (userId: string) =>
      taskService.assignUser(columnId, task.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('User assigned!');
      setShowAssignDropdown(false);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (userId: string) =>
      taskService.unassignUser(columnId, task.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('User unassigned!');
    },
  });

  const availableUsers = boardMembers.filter(
    (member) => !task.assignments.find((a) => a.user.id === member.id),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {task.description && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-gray-700 text-sm">{task.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-2">Priority</h3>
          <span
            className={`inline-block px-3 py-1 rounded text-sm ${
              task.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}
          >
            {task.priority || 'Medium'}
          </span>
        </div>

        {task.dueDate && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-2">Due Date</h3>
            <p className="text-gray-700 text-sm">
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-3">Assigned To</h3>
          <div className="space-y-2 mb-3">
            {task.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span className="text-sm">{assignment.user.firstName}</span>
                <button
                  onClick={() => unassignMutation.mutate(assignment.user.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="w-full flex items-center gap-2 px-3 py-2 border border-dashed rounded text-sm text-gray-600 hover:border-gray-400"
            >
              <Plus className="w-4 h-4" />
              Assign User
            </button>

            {showAssignDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded shadow-lg z-10">
                {availableUsers.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    All users assigned
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => assignMutation.mutate(user.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                    >
                      {user.firstName} {user.lastName}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
