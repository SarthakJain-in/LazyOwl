import { getAuthHeaders } from "./authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/roadmaps`;

export const roadmapService = {
  // Fetch all roadmaps
  getAllRoadmaps: async () => {
    const response = await fetch(API_URL, {
      headers: { ...getAuthHeaders() },
    });
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
        ...getAuthHeaders(),
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
        ...getAuthHeaders(),
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
        ...getAuthHeaders(),
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
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to toggle roadmap");
    return response.json();
  },

  deleteRoadmap: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to delete roadmap");
    return response.json();
  },

  importRoadmapFromPDF: async (file, category) => {
    const formData = new FormData();
    formData.append("pdfFile", file);
    if (category) {
      formData.append("category", category);
    }

    const response = await fetch(`${API_URL}/import-pdf`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData,
      // Note: Do NOT set Content-Type header — browser sets it automatically with boundary for FormData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import roadmap from PDF");
    }
    return response.json();
  },

  downloadSamplePDF: async () => {
    const response = await fetch(`${API_URL}/sample-pdf`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Failed to download sample PDF");
    const blob = await response.blob();
    // Trigger browser download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-roadmap-template.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
