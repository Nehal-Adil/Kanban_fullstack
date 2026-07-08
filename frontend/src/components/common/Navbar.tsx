import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import toast from "react-hot-toast";

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Kanban</h1>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
