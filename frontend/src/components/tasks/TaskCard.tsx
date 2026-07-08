import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition"
    >
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

      <div className="flex items-center justify-between gap-2">
        {task.priority && (
          <span
            className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>
        )}

        {task.dueDate && (
          <div className="text-xs text-gray-600">
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {task.assignments.length > 0 && (
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
  );
}

export default TaskCard;
