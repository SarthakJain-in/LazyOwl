const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/notes`;

export const noteService = {
  getAllNotes: async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch notes");
    return response.json();
  },

  createNote: async (noteData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error("Failed to create note");
    return response.json();
  },

  updateNote: async (id, noteData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error("Failed to update note");
    return response.json();
  },

  deleteNote: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete note");
    return response.json();
  },
};
