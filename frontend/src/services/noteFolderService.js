import { getAuthHeaders } from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/note-folders`;

export const noteFolderService = {
  getAllFolders: async () => {
    const response = await fetch(API_URL, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to fetch note folders");
    return response.json();
  },

  createFolder: async (folderData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(folderData),
    });
    if (!response.ok) throw new Error("Failed to create note folder");
    return response.json();
  },

  updateFolder: async (id, folderData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(folderData),
    });
    if (!response.ok) throw new Error("Failed to update note folder");
    return response.json();
  },

  deleteFolder: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to delete note folder");
    return response.json();
  },
};
