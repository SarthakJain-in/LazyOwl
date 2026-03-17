const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/roadmaps`;

export const roadmapService = {
  // Fetch all roadmaps
  getAllRoadmaps: async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch roadmaps");
    }
    return response.json();
  },

  createRoadmap: async (roadmapData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roadmapData),
    });
    if (!response.ok) {
      throw new Error("Failed to create roadmap");
    }
    return response.json();
  },

  updateRoadmap: async (id, roadmapData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roadmapData),
    });
    if (!response.ok) {
      throw new Error("Failed to update roadmap");
    }
    return response.json();
  },

  generateRoadmap: async (topic, category) => {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, category }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate roadmap with AI");
    }
    return response.json();
  },

  toggleRoadmapActive: async (id) => {
    const response = await fetch(`${API_URL}/${id}/active`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to toggle roadmap");
    return response.json();
  },

  deleteRoadmap: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete roadmap");
    return response.json();
  },
};
