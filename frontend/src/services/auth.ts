import type { AuthResponse, User } from "../types/auth";
import { axiosClient } from "./api";

interface RegisterData {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosClient.post("/auth/register", data);
    return response.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await axiosClient.post("/auth/login", data);
    return response.data;
  },

  async getProfile(): Promise<AuthResponse> {
    const response = await axiosClient.get("/users/profile");
    return response.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const response = await axiosClient.put("/users/profile", data);
    return response.data;
  },
};
