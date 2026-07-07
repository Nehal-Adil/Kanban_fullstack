import type { User } from "./auth";
import type { Column } from "./column";

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
