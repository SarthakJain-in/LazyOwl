const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/auth`;

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to register");

    // Save user and token to local storage
    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  login: async (userData) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to login");

    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  addFocusTime: async (focusSeconds) => {
    const numericSeconds = Number(focusSeconds);
    const response = await fetch(`${API_URL}/focus`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ focusSeconds: numericSeconds }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update focus time");

    return data;
  },

  // Helper: Get the current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// Helper: Returns auth headers with Bearer token for protected API calls
export const getAuthHeaders = () => {
  const user = authService.getCurrentUser();
  return user?.token
    ? { Authorization: `Bearer ${user.token}` }
    : {};
};
