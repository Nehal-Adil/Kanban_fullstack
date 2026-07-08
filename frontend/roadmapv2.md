# React + Vite Kanban Frontend - Complete Roadmap 🎨

## Latest Tech Stack (June 2026) - All Code Included

---

## Tech Stack

| Package         | Version | Why                         |
| --------------- | ------- | --------------------------- |
| React           | 18.x    | Latest stable               |
| Vite            | 6.x     | Lightning fast build        |
| Tailwind CSS    | v4.0+   | 5x faster, CSS-first config |
| TypeScript      | 5.x     | Type safety                 |
| TanStack Query  | 5.x     | Server state management     |
| Zustand         | 4.x     | Client state                |
| React Router    | 6.x     | Routing                     |
| React Hook Form | 7.x     | Form handling               |
| Zod             | 3.x     | Validation                  |
| Axios           | 1.x     | HTTP client                 |

---

## Phase 0: Project Setup (Tailwind v4 + Latest Everything)

### Create Vite + React Project

```bash
npm create vite@latest kanban-frontend -- --template react-ts
cd kanban-frontend
npm install
```

### Install Dependencies

```bash
# Core
npm install react-router-dom zustand axios

# Data fetching
npm install @tanstack/react-query

# Forms
npm install react-hook-form zod @hookform/resolvers

# UI
npm install lucide-react react-hot-toast

# DevTools
npm install -D @tanstack/react-query-devtools
```

### Install Tailwind CSS v4 (Latest - NO CONFIG FILE!)

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### Vite Config (vite.config.ts) - WITH Tailwind Plugin

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});
```

### CSS Setup (src/index.css) - JUST ONE LINE!

```css
@import "tailwindcss";
```

That's it! Tailwind v4 is auto-configured. No `tailwind.config.js`, no PostCSS config needed.

### Optional: Custom Tailwind Theme (src/index.css)

If you want custom colors, add `@theme` block:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-danger: #ef4444;
  --spacing-safe: safe;
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### Folder Structure

```
/src
  /config
    queryClient.ts
  /services
    api.ts
    auth.ts
    board.ts
    task.ts
  /store
    authStore.ts
  /pages
    LoginPage.tsx
    RegisterPage.tsx
    BoardsPage.tsx
    BoardDetailPage.tsx
  /components
    /auth
      LoginForm.tsx
      RegisterForm.tsx
    /boards
      BoardCard.tsx
      BoardList.tsx
    /columns
      ColumnCard.tsx
    /tasks
      TaskCard.tsx
    /common
      Navbar.tsx
      LoadingSpinner.tsx
  /types
    index.ts
  /hooks
    useAuth.ts
  App.tsx
  main.tsx
  index.css

.env.example
.env.local
vite.config.ts
```

### Environment (.env.example)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Phase 1: Configuration & Services

### Types (src/types/index.ts)

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  color?: string;
  owner: User;
  members: User[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  columnId: string;
  assignments: TaskAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  user: User;
  taskId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
```

### QueryClient Config (src/config/queryClient.ts)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### API Service (src/services/api.ts)

```typescript
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
```

### Auth Service (src/services/auth.ts)

```typescript
import { api } from "./api";
import { User, AuthResponse } from "../types";

export const authService = {
  async register(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get("/users/profile");
    return response.data;
  },
};
```

### Board Service (src/services/board.ts)

```typescript
import { api } from "./api";
import { Board, Column } from "../types";

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await api.get("/boards");
    return response.data;
  },

  async createBoard(data: {
    title: string;
    description?: string;
    color?: string;
  }): Promise<Board> {
    const response = await api.post("/boards", data);
    return response.data;
  },

  async getBoardById(boardId: string): Promise<Board> {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },

  async updateBoard(
    boardId: string,
    data: { title?: string; description?: string; color?: string },
  ): Promise<Board> {
    const response = await api.put(`/boards/${boardId}`, data);
    return response.data;
  },

  async deleteBoard(boardId: string): Promise<void> {
    await api.delete(`/boards/${boardId}`);
  },

  async getColumns(boardId: string): Promise<Column[]> {
    const response = await api.get(`/boards/${boardId}/columns`);
    return response.data;
  },

  async createColumn(
    boardId: string,
    data: { title: string; position?: number },
  ): Promise<Column> {
    const response = await api.post(`/boards/${boardId}/columns`, data);
    return response.data;
  },

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    await api.delete(`/boards/${boardId}/columns/${columnId}`);
  },
};
```

### Task Service (src/services/task.ts)

```typescript
import { api } from "./api";
import { Task } from "../types";

export const taskService = {
  async getTasks(columnId: string): Promise<Task[]> {
    const response = await api.get(`/columns/${columnId}/tasks`);
    return response.data;
  },

  async createTask(
    columnId: string,
    data: {
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
    },
  ): Promise<Task> {
    const response = await api.post(`/columns/${columnId}/tasks`, data);
    return response.data;
  },

  async updateTask(
    columnId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      dueDate?: string;
    },
  ): Promise<Task> {
    const response = await api.put(
      `/columns/${columnId}/tasks/${taskId}`,
      data,
    );
    return response.data;
  },

  async deleteTask(columnId: string, taskId: string): Promise<void> {
    await api.delete(`/columns/${columnId}/tasks/${taskId}`);
  },

  async assignUser(
    columnId: string,
    taskId: string,
    userId: string,
  ): Promise<Task> {
    const response = await api.post(
      `/columns/${columnId}/tasks/${taskId}/assign`,
      { userId },
    );
    return response.data;
  },

  async unassignUser(
    columnId: string,
    taskId: string,
    userId: string,
  ): Promise<Task> {
    const response = await api.delete(
      `/columns/${columnId}/tasks/${taskId}/assign/${userId}`,
    );
    return response.data;
  },
};
```

### Auth Store (src/store/authStore.ts)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
```

---

## Phase 2: Authentication Pages

### Login Form (src/components/auth/LoginForm.tsx)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be 6+ characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data)
      setAuth(response.user, response.accessToken)
      toast.success('Login successful!')
      navigate('/boards')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Register
        </Link>
      </p>
    </form>
  )
}
```

### Register Form (src/components/auth/RegisterForm.tsx)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  password: z.string().min(8, 'Password must be 8+ characters'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authService.register(data)
      setAuth(response.user, response.accessToken)
      toast.success('Registration successful!')
      navigate('/boards')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            {...register('firstName')}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="John"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            {...register('lastName')}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Doe"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  )
}
```

### Login Page (src/pages/LoginPage.tsx)

```typescript
import { LoginForm } from '../components/auth/LoginForm'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/boards')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Kanban</h1>
        <p className="text-gray-600 text-center mb-8">Login to your account</p>
        <LoginForm />
      </div>
    </div>
  )
}
```

### Register Page (src/pages/RegisterPage.tsx)

```typescript
import { RegisterForm } from '../components/auth/RegisterForm'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/boards')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Kanban</h1>
        <p className="text-gray-600 text-center mb-8">Create your account</p>
        <RegisterForm />
      </div>
    </div>
  )
}
```

---

## Phase 3: Navbar & Layout

### Navbar (src/components/common/Navbar.tsx)

```typescript
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, Home } from 'lucide-react'
import toast from 'react-hot-toast'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

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
  )
}
```

### Loading Spinner (src/components/common/LoadingSpinner.tsx)

```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
```

---

## Phase 4: Boards Page

### Board Card (src/components/boards/BoardCard.tsx)

```typescript
import { Board } from '../../types'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

interface BoardCardProps {
  board: Board
  onDelete?: (id: string) => void
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition p-4 border-t-4"
      style={{ borderTopColor: board.color || '#3b82f6' }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg line-clamp-2">{board.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(board.id)
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description}</p>

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
  )
}
```

### Boards Page (src/pages/BoardsPage.tsx)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardService } from '../services/board'
import { BoardCard } from '../components/boards/BoardCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Navbar } from '../components/common/Navbar'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function BoardsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBoard, setNewBoard] = useState({ title: '', description: '' })
  const queryClient = useQueryClient()

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  })

  const createMutation = useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      setShowCreateModal(false)
      setNewBoard({ title: '', description: '' })
      toast.success('Board created!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      toast.success('Board deleted!')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoard.title.trim()) {
      toast.error('Board title required')
      return
    }
    createMutation.mutate(newBoard)
  }

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
                onDelete={(id) => deleteMutation.mutate(id)}
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
                  <label className="block text-sm font-medium mb-1">Title</label>
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
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Phase 5: Board Detail Page

### Column Card (src/components/columns/ColumnCard.tsx)

```typescript
import { Column } from '../../types'
import { TaskCard } from '../tasks/TaskCard'
import { Trash2 } from 'lucide-react'

interface ColumnCardProps {
  column: Column
  onDelete?: (id: string) => void
  onTaskClick?: (taskId: string) => void
}

export function ColumnCard({
  column,
  onDelete,
  onTaskClick,
}: ColumnCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 flex flex-col max-h-[70vh] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <button
          onClick={() => onDelete?.(column.id)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {column.tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task.id)}
          />
        ))}
      </div>

      <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 text-sm font-medium">
        + Add Task
      </button>
    </div>
  )
}
```

### Task Card (src/components/tasks/TaskCard.tsx)

```typescript
import { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition"
    >
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

      <div className="flex items-center justify-between gap-2">
        {task.priority && (
          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
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
  )
}
```

### Board Detail Page (src/pages/BoardDetailPage.tsx)

```typescript
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardService } from '../services/board'
import { ColumnCard } from '../components/columns/ColumnCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Navbar } from '../components/common/Navbar'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const [showCreateColumn, setShowCreateColumn] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')
  const queryClient = useQueryClient()

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId!),
    enabled: !!boardId,
  })

  const createColumnMutation = useMutation({
    mutationFn: (title: string) =>
      boardService.createColumn(boardId!, {
        title,
        position: (board?.columns.length || 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setShowCreateColumn(false)
      setColumnTitle('')
      toast.success('Column created!')
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) =>
      boardService.deleteColumn(boardId!, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Column deleted!')
    },
  })

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!columnTitle.trim()) {
      toast.error('Column title required')
      return
    }
    createColumnMutation.mutate(columnTitle)
  }

  if (isLoading) return <LoadingSpinner />

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
            <div className="bg-white rounded-lg p-4 shadow-sm w-80 flex-shrink-0">
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
                    {createColumnMutation.isPending ? '...' : 'Add'}
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
  )
}
```

---

## Phase 6: Main App & Routing

### App.tsx

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './config/queryClient'
import { useAuthStore } from './store/authStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { BoardsPage } from './pages/BoardsPage'
import { BoardDetailPage } from './pages/BoardDetailPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <BoardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <ProtectedRoute>
                <BoardDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/boards" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
```

### main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Final Steps

### Start Development

```bash
npm run dev
# Opens at http://localhost:5173
```

### Project Checklist

- [ ] Phase 0: Vite + Tailwind v4 working
- [ ] Phase 1: Services and store configured
- [ ] Phase 2: Login/Register pages working
- [ ] Phase 3: Navbar displays
- [ ] Phase 4: Boards listing working
- [ ] Phase 5: Board detail and columns
- [ ] Phase 6: Full routing works
- [ ] Can create boards, columns, and see data

### Git Setup

```bash
git init
git add .
git commit -m "Initial kanban frontend"
git remote add origin https://github.com/yourusername/kanban-frontend.git
git push -u origin main
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
# Set VITE_API_URL to your backend URL
```

---

## Key Notes

✅ **Tailwind v4** - NO config file needed, just `@import "tailwindcss"`  
✅ **Vite** - Super fast, instant HMR  
✅ **TanStack Query** - Auto caching and refetching  
✅ **JWT logout** - Just clear token + Zustand store (no backend route needed)  
✅ **Type-safe** - Full TypeScript throughout  
✅ **Ready to ship** - All code included, just copy-paste!

**Start with Phase 0 and build it out!** 🚀
