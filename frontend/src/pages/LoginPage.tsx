import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import LoginForm from "../components/auth/LoginForm";

function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/boards");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Kanban</h1>
        <p className="text-gray-600 text-center mb-8">Login to your account</p>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
