import { Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column } from '../../types/column';
import SortableTaskCard from '../tasks/SortableTaskCard';

interface ColumnCardProps {
  column: Column;
  onDelete?: (id: string) => void;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
}

function ColumnCard({
  column,
  onDelete,
  onTaskClick,
  onAddTask,
}: ColumnCardProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80 shrink-0 flex flex-col max-h-[70vh] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          {column.title}
          <span className="ml-2 text-xs text-gray-500 font-normal">
            {column.tasks?.length || 0}
          </span>
        </h3>
        <button
          onClick={() => onDelete?.(column.id)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <SortableContext
        items={(column.tasks || []).map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto space-y-2 min-h-10"
        >
          {column.tasks?.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task.id)}
            />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTask?.(column.id)}
        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 text-sm font-medium"
      >
        + Add Task
      </button>
    </div>
  );
}

export default ColumnCard;
