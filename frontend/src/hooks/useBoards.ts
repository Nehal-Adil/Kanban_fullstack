import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../services/board";
import toast from "react-hot-toast";

export const useBoards = () => {
  const queryClient = useQueryClient();

  // Fetching
  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: boardService.getBoards,
  });

  // Creating
  const createMutation = useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: () => {
      // TanStack Query immediately marks the existing ['boards'] cache as dirty and automatically re-fetches the fresh list from the server. The UI updates seamlessly.
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board created!");
    },
  });

  // Deleting
  const deleteMutation = useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted!");
    },
  });

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    createBoard: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isCreateSuccess: createMutation.isSuccess,
    deleteBoard: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
