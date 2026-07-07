import type { User } from "./auth";

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
