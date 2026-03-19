import { getAuthHeaders } from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/modules`;

export const moduleService = {
  getModules: async () => {
    const response = await fetch(API_URL, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to fetch modules");
    return response.json();
  },

  createModule: async (moduleData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(moduleData),
    });
    if (!response.ok) throw new Error("Failed to create module");
    return response.json();
  },

  updateModule: async (id, moduleData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(moduleData),
    });
    if (!response.ok) throw new Error("Failed to update module");
    return response.json();
  },

  reorderModules: async (modulesArray) => {
    const response = await fetch(`${API_URL}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ modules: modulesArray }),
    });
    if (!response.ok) throw new Error("Failed to reorder modules");
    return response.json();
  },

  deleteModule: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to delete module");
    return response.json();
  },
};
