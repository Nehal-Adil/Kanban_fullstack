import { Plus } from "lucide-react";
import BoardCard from "../components/boards/BoardCard";
import Navbar from "../components/common/Navbar";
import { useEffect, useState } from "react";
import { useBoards } from "../hooks/useBoards";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

function BoardsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: "", description: "" });

  const {
    boards,
    isLoading,
    createBoard,
    isCreating,
    isCreateSuccess,
    deleteBoard,
  } = useBoards();

  useEffect(() => {
    if (isCreateSuccess) {
      setShowCreateModal(false);
      setNewBoard({ title: "", description: "" });
    }
  }, [isCreateSuccess]);

  const handleCreate = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newBoard.title.trim()) {
      toast.error("Board title required");
      return;
    }
    createBoard(newBoard);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Boards</h1>
            <p className="text-gray-600 mt-1">Manage your projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            New Board
          </button>
        </div>

        {isLoading && <LoadingSpinner />}

        {boards && boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No boards yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Create your first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards?.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={(id) => deleteBoard(id)}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Board</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newBoard.title}
                    onChange={(e) =>
                      setNewBoard({ ...newBoard, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={newBoard.description}
                    onChange={(e) =>
                      setNewBoard({ ...newBoard, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardsPage;
