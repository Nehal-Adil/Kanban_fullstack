import { Trash2 } from 'lucide-react';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
}

function getDueLabel(dueDate: string): { label: string; overdue: boolean } {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { label: `${-diffDays}d overdue`, overdue: true };
  if (diffDays === 0) return { label: 'Today', overdue: false };
  if (diffDays === 1) return { label: 'Tomorrow', overdue: false };
  return { label: `${diffDays} days left`, overdue: false };
}

function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition group">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0" onClick={onClick}>
          <h4 className="font-medium text-sm mb-2 line-clamp-2">
            {task.title}
          </h4>

          <div className="flex items-center justify-between gap-2">
            {task.priority && (
              <span
                className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                  task.priority,
                )}`}
              >
                {task.priority}
              </span>
            )}

            {task.dueDate && (
              <div
                className={`text-xs ${
                  getDueLabel(task.dueDate).overdue
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {getDueLabel(task.dueDate).label}
              </div>
            )}
          </div>

          {task.assignments?.length > 0 && (
            <div className="flex -space-x-2 mt-2">
              {task.assignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center border-2 border-white"
                  title={assignment.user.firstName}
                >
                  {assignment.user.firstName[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
