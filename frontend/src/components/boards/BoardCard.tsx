import { Trash2 } from "lucide-react";
import type { Board } from "../../types/board";
import { useNavigate } from "react-router-dom";

interface BoardCardProps {
  board: Board;
  onDelete?: (id: string) => void;
}

function BoardCard({ board, onDelete }: BoardCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition p-4 border-t-4"
      style={{ borderTopColor: board.color || "#3b82f6" }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg line-clamp-2">{board.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(board.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {board.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {board.members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center border-2 border-white"
              title={member.firstName}
            >
              {member.firstName[0]}
            </div>
          ))}
          {board.members.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center border-2 border-white">
              +{board.members.length - 3}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/boards/${board.id}`)}
          className="text-primary text-sm font-medium hover:underline"
        >
          Open
        </button>
      </div>
    </div>
  );
}

export default BoardCard;
