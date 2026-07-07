import type { Task } from "../types/task";
import { axiosClient } from "./api";

interface CreateTaskData {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  label?: string;
}

export const taskService = {
  async getTasks(columnId: string): Promise<Task[]> {
    const response = await axiosClient.get(`/columns/${columnId}/tasks`);
    return response.data;
  },

  async createTask(columnId: string, data: CreateTaskData): Promise<Task> {
    const response = await axiosClient.post(`/columns/${columnId}/tasks`, data);
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
      label?: string;
    },
  ): Promise<Task> {
    const response = await axiosClient.put(
      `/columns/${columnId}/tasks/${taskId}`,
      data,
    );
    return response.data;
  },

  async deleteTask(columnId: string, taskId: string): Promise<void> {
    await axiosClient.delete(`/columns/${columnId}/tasks/${taskId}`);
  },

  async moveTask(
    columnId: string,
    taskId: string,
    data: { newColumnId: string; position: number },
  ): Promise<Task> {
    const response = await axiosClient.put(
      `/columns/${columnId}/tasks/${taskId}/move`,
      data,
    );
    return response.data;
  },

  async assignUser(
    columnId: string,
    taskId: string,
    userId: string,
  ): Promise<Task> {
    const response = await axiosClient.post(
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
    const response = await axiosClient.delete(
      `/columns/${columnId}/tasks/${taskId}/assign/${userId}`,
    );
    return response.data;
  },
};
