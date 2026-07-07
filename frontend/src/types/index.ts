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
  label?: string;
  columnId: string;
  assignments: TaskAssignment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  user: User;
  taskId: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
