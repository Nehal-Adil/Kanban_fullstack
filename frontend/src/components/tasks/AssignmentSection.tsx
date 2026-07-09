import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Board } from '../../types/board';
import { taskService } from '../../services/task';

interface AssignmentSectionProps {
  task: Task;
  board: Board;
}

function AssignmentSection({ task, board }: AssignmentSectionProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const queryClient = useQueryClient();

  // Owner + members, deduplicated
  const allMembers = [board.owner, ...board.members].filter(
    (user, index, arr) => arr.findIndex((u) => u.id === user.id) === index,
  );

  const assignedIds = task.assignments.map((a) => a.user.id);
  const availableMembers = allMembers.filter(
    (u) => !assignedIds.includes(u.id),
  );

  const assignMutation = useMutation({
    mutationFn: (userId: string) =>
      taskService.assignUser(task.columnId, task.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      setSelectedUserId('');
      toast.success('User assigned!');
    },
    onError: () => toast.error('Failed to assign user'),
  });

  const unassignMutation = useMutation({
    mutationFn: (userId: string) =>
      taskService.unassignUser(task.columnId, task.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('User unassigned');
    },
    onError: () => toast.error('Failed to unassign user'),
  });

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">Assignees</h4>

      <div className="space-y-2 mb-3">
        {task.assignments.length === 0 && (
          <p className="text-xs text-gray-500">No one assigned yet</p>
        )}
        {task.assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {assignment.user.firstName[0]}
              </div>
              <span className="text-sm">
                {assignment.user.firstName} {assignment.user.lastName}
              </span>
            </div>
            <button
              onClick={() => unassignMutation.mutate(assignment.user.id)}
              disabled={unassignMutation.isPending}
              className="p-1 hover:bg-gray-200 rounded"
              aria-label={`Unassign ${assignment.user.firstName}`}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      {availableMembers.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
          >
            <option value="">Select member...</option>
            {availableMembers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              selectedUserId && assignMutation.mutate(selectedUserId)
            }
            disabled={!selectedUserId || assignMutation.isPending}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
}

export default AssignmentSection;
