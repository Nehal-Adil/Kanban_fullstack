import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { boardService } from "../services/board";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import Navbar from "../components/common/Navbar";
import ColumnCard from "../components/columns/ColumnCard";
import { Plus } from "lucide-react";

function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: board, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => boardService.getBoardById(boardId!),
  });

  const createColumnMutation = useMutation({
    mutationFn: (title: string) =>
      boardService.createColumn(boardId!, {
        title,
        position: (board?.columns.length || 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setShowCreateColumn(false);
      setColumnTitle("");
      toast.success("Column created!");
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) =>
      boardService.deleteColumn(boardId!, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Column deleted!");
    },
  });

  const handleCreateColumn = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!columnTitle.trim()) {
      toast.error("Column title required");
      return;
    }
    createColumnMutation.mutate(columnTitle);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">{board?.title}</h1>
        <p className="text-gray-600 mb-8">{board?.description}</p>

        <div className="flex overflow-x-auto gap-4 pb-4">
          {board?.columns.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
              onDelete={(id) => deleteColumnMutation.mutate(id)}
            />
          ))}

          {!showCreateColumn ? (
            <button
              onClick={() => setShowCreateColumn(true)}
              className="flex items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
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
                    {createColumnMutation.isPending ? "..." : "Add"}
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
      </div>
    </div>
  );
}

export default BoardDetailPage;
