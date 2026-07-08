import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth";

export const useAuth = () => {
  const { user, token, setAuth, logout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    enabled: Boolean(token),
  });

  return {
    user,
    token,
    setAuth,
    logout,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    registerLoading: registerMutation.isPending,
    loginLoading: loginMutation.isPending,
    profileLoading: profileQuery.isLoading,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
};
