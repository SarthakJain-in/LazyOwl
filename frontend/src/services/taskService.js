import { getAuthHeaders } from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/tasks`;

export const taskService = {
  getTasks: async () => {
    const response = await fetch(API_URL, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  createTask: async (taskData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  toggleTask: async (id) => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: "PATCH",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to update task status");
    return response.json();
  },

  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  },

  reorderTasks: async (tasksArray) => {
    const response = await fetch(`${API_URL}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ tasks: tasksArray }),
    });
    if (!response.ok) throw new Error("Failed to reorder tasks");
    return response.json();
  },

  deleteTask: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to delete task");
    return response.json();
  },
};
