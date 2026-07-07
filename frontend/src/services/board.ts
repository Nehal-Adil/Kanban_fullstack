import type { Board } from "../types/board";
import type { Column } from "../types/column";
import { axiosClient } from "./api";

export const boardService = {
  async createBoard(data: {
    title: string;
    description?: string;
    color?: string;
  }): Promise<Board> {
    const response = await axiosClient.post("/boards", data);
    return response.data;
  },

  async getBoards(): Promise<Board[]> {
    const response = await axiosClient.get("/boards");
    return response.data;
  },

  async getBoardById(boardId: string): Promise<Board> {
    const response = await axiosClient.get(`/boards/${boardId}`);
    return response.data;
  },

  async updateBoard(
    boardId: string,
    data: { title?: string; description?: string; color?: string },
  ): Promise<Board> {
    const response = await axiosClient.put(`/boards/${boardId}`, data);
    return response.data;
  },

  async deleteBoard(boardId: string): Promise<void> {
    await axiosClient.delete(`/boards/${boardId}`);
  },

  async addMember(boardId: string, userId: string): Promise<Board> {
    const response = await axiosClient.post(`/boards/${boardId}/members`, {
      userId,
    });
    return response.data;
  },

  async removeMember(boardId: string, userId: string): Promise<Board> {
    const response = await axiosClient.delete(
      `/boards/${boardId}/members/${userId}`,
    );
    return response.data;
  },

  //   Columns

  async getColumns(boardId: string): Promise<Column[]> {
    const response = await axiosClient.get(`/boards/${boardId}/columns`);
    return response.data;
  },

  async getColumnById(boardId: string, columnId: string): Promise<Column> {
    const response = await axiosClient.get(
      `/boards/${boardId}/columns/${columnId}`,
    );
    return response.data;
  },

  async createColumn(
    boardId: string,
    data: { title: string; position?: number },
  ): Promise<Column> {
    const response = await axiosClient.post(`/boards/${boardId}/columns`, data);
    return response.data;
  },

  async updateColumn(
    boardId: string,
    columnId: string,
    data: { title?: string; position?: number },
  ): Promise<Column> {
    const response = await axiosClient.put(
      `/boards/${boardId}/columns/${columnId}`,
      data,
    );
    return response.data;
  },

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    const response = await axiosClient.delete(
      `/boards/${boardId}/columns/${columnId}`,
    );
    return response.data;
  },
};
