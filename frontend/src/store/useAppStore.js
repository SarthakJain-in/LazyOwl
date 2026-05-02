import { create } from "zustand";
import { taskService } from "../services/taskService";
import { roadmapService } from "../services/roadmapService";
import { moduleService } from "../services/moduleService";
import { noteService } from "../services/noteService";
import { noteFolderService } from "../services/noteFolderService";
import { authService } from "../services/authService";
import { getAuthHeaders } from "../services/authService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

if (!BASE_URL && import.meta.env.PROD) {
  console.error("⚠️ CRITICAL DEPLOYMENT WARNING: VITE_API_BASE_URL environment variable is missing. API calls will fail.");
}

export const useAppStore = create((set, get) => ({
  tasks: [],
  modules: [],
  roadmaps: [],
  notes: [],
  noteFolders: [],
  streak: 0,
  isLoading: false,
  isGenerating: false,
  isImporting: false,
  error: null,
  isDarkMode: localStorage.getItem("theme") ? localStorage.getItem("theme") === "dark" : true,

  // --- AUTH STATE ---
  user: authService.getCurrentUser(),

  // --- FOCUS TIMER STATE ---
  focusState: {
    timeLeft: 25 * 60,
    workTimeLeft: 25 * 60,
    breakTimeLeft: 5 * 60,
    isActive: false,
    mode: "work",
    lastTick: null, // to calculate elapsed time even if unmounted
  },
  setFocusState: (updates) => set((state) => ({
    focusState: { ...state.focusState, ...updates }
  })),

  // --- THEME ACTIONS ---
  toggleTheme: (x, y) => {
    const update = () => {
      const newTheme = !get().isDarkMode;
      set({ isDarkMode: newTheme });

      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    };

    if (x !== undefined && y !== undefined) {
      document.documentElement.style.setProperty("--ripple-x", `${x}px`);
      document.documentElement.style.setProperty("--ripple-y", `${y}px`);
    }

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  },

  initTheme: () => {
    // Default to dark unless explicitly set to light
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.remove("dark");
      set({ isDarkMode: false });
    } else {
      document.documentElement.classList.add("dark");
      set({ isDarkMode: true });
    }
  },

  // --- AUTH ACTIONS ---
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login({ email, password });
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register({ name, email, password });
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      tasks: [],
      modules: [],
      roadmaps: [],
      notes: [],
      noteFolders: [],
      streak: 0,
      error: null,
    });
  },

  addFocusTime: async (focusSeconds) => {
    try {
      const data = await authService.addFocusTime(focusSeconds);
      // Update local user state and localStorage to keep it in sync
      set((state) => {
        if (!state.user) return state;
        const updatedUser = { ...state.user, totalFocusSeconds: data.totalFocusSeconds };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
    } catch (error) {
      console.error("Error updating focus time:", error);
    }
  },

  // 1. Fetch tasks using the service
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await taskService.getTasks();
      set({ tasks: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStreak: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/streak`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await response.json();
      set({ streak: data.streak });
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  },

  // 2. Toggle Task Status (Optimistic Update)
  toggleTask: async (taskId) => {
    const previousTasks = get().tasks;
    const previousRoadmaps = get().roadmaps;
    const previousStreak = get().streak;

    // 1. Optimistic UI Update: Toggle task instantly
    set({
      tasks: previousTasks.map((task) => {
        if (task._id === taskId) {
          const isNowCompleted = !task.isCompleted;
          return {
            ...task,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : null,
          };
        }
        return task;
      }),
    });

    try {
      // 2. Call the backend
      await taskService.toggleTask(taskId);

      // 3. Success! Now fetch the fresh data that the backend just recalculated
      // We do this because the backend handles the Roadmap % and the Streak logic
      await Promise.all([get().fetchRoadmaps(), get().fetchStreak()]);
    } catch (error) {
      console.error("API Error, reverting UI:", error);
      // 4. If backend fails, revert everything back to the previous state
      set({
        tasks: previousTasks,
        roadmaps: previousRoadmaps,
        streak: previousStreak,
      });
    }
  },

  // 3. Add a new task
  addTask: async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      // Add the new task to the end of the list in the UI
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      console.error("Error creating task:", error);
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const updatedTask = await taskService.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
      }));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  },

  updateTaskOrder: async (tasksArray) => {
    const previousTasks = get().tasks;

    // Optimistic UI update
    set({
      tasks: previousTasks.map((t) => {
        const updated = tasksArray.find((ut) => ut._id === t._id);
        return updated
          ? { ...t, order: updated.order, moduleId: updated.moduleId }
          : t;
      }),
    });

    try {
      await taskService.reorderTasks(tasksArray);
    } catch (error) {
      console.error("Error reordering tasks:", error);
      // Revert if error
      set({ tasks: previousTasks });
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
      get().fetchRoadmaps(); // Keep roadmaps in sync with backend
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  },

  // --- MODULE ACTIONS ---
  fetchModules: async () => {
    try {
      const data = await moduleService.getModules();
      set({ modules: data });
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  },

  addModule: async (moduleData) => {
    try {
      const newModule = await moduleService.createModule(moduleData);
      set((state) => ({ modules: [...state.modules, newModule] }));
      return newModule;
    } catch (error) {
      console.error("Error creating module:", error);
    }
  },

  updateModule: async (id, moduleData) => {
    try {
      const updatedModule = await moduleService.updateModule(id, moduleData);
      set((state) => ({
        modules: state.modules.map((m) => (m._id === id ? updatedModule : m)),
      }));
    } catch (error) {
      console.error("Error updating module:", error);
    }
  },

  updateModuleOrder: async (modulesArray) => {
    const previousModules = get().modules;

    // Optimistic UI update
    set({
      modules: previousModules.map((m) => {
        const updated = modulesArray.find((um) => um._id === m._id);
        return updated ? { ...m, order: updated.order } : m;
      }),
    });

    try {
      await moduleService.reorderModules(modulesArray);
    } catch (error) {
      console.error("Error reordering modules:", error);
      set({ modules: previousModules });
    }
  },

  deleteModule: async (id) => {
    try {
      await moduleService.deleteModule(id);
      set((state) => ({
        modules: state.modules.filter((m) => m._id !== id),
        tasks: state.tasks.filter((t) => t.moduleId !== id),
      }));
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  },

  // --- ROADMAP ACTIONS ---
  fetchRoadmaps: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await roadmapService.getAllRoadmaps();
      set({ roadmaps: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  addRoadmap: async (roadmapData) => {
    try {
      const newRoadmap = await roadmapService.createRoadmap(roadmapData);
      set((state) => ({ roadmaps: [newRoadmap, ...state.roadmaps] }));
      return newRoadmap;
    } catch (error) {
      console.error("Error creating roadmap:", error);
    }
  },

  updateRoadmap: async (id, roadmapData) => {
    try {
      const updatedRoadmap = await roadmapService.updateRoadmap(
        id,
        roadmapData,
      );
      set((state) => ({
        roadmaps: state.roadmaps.map((r) =>
          r._id === id ? updatedRoadmap : r,
        ),
      }));
    } catch (error) {
      console.error("Error updating roadmap:", error);
    }
  },

  toggleRoadmapActive: async (id) => {
    try {
      // Assuming you added the api call to a roadmapService object
      const updatedRoadmap = await roadmapService.toggleRoadmapActive(id);
      set((state) => ({
        roadmaps: state.roadmaps.map((rm) =>
          rm._id === id ? updatedRoadmap : rm,
        ),
      }));
    } catch (error) {
      console.error("Error toggling roadmap:", error);
    }
  },

  deleteRoadmap: async (id) => {
    try {
      // 1. Call the service
      await roadmapService.deleteRoadmap(id);

      // 2. Update local state
      set((state) => ({
        roadmaps: state.roadmaps.filter((r) => r._id !== id),
        modules: state.modules.filter((m) => m.roadmapId !== id),
        tasks: state.tasks.filter((t) => t.roadmapId !== id),
      }));

      // 3. Refresh dependent data
      get().fetchStreak();
    } catch (error) {
      console.error("Error deleting roadmap:", error);
    }
  },

  // --- AI GENERATOR ---
  generateRoadmap: async (topic, category) => {
    set({ isGenerating: true, error: null });
    try {
      await roadmapService.generateRoadmap(topic, category);

      // Refresh both roadmaps and tasks to show the newly generated data!
      const updatedRoadmaps = await roadmapService.getAllRoadmaps();
      const updatedModules = await moduleService.getModules();
      const updatedTasks = await taskService.getTasks();

      set({
        roadmaps: updatedRoadmaps,
        modules: updatedModules,
        tasks: updatedTasks,
        isGenerating: false,
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      set({ error: error.message, isGenerating: false });
    }
  },

  // --- PDF IMPORT ---
  importRoadmapFromPDF: async (file, category) => {
    set({ isImporting: true, error: null });
    try {
      await roadmapService.importRoadmapFromPDF(file, category);

      // Refresh all data to show the newly imported roadmap
      const updatedRoadmaps = await roadmapService.getAllRoadmaps();
      const updatedModules = await moduleService.getModules();
      const updatedTasks = await taskService.getTasks();

      set({
        roadmaps: updatedRoadmaps,
        modules: updatedModules,
        tasks: updatedTasks,
        isImporting: false,
      });
    } catch (error) {
      console.error("PDF Import Error:", error);
      set({ error: error.message, isImporting: false });
      throw error; // Re-throw so the UI can show the error message
    }
  },

  // --- NOTE ACTIONS ---
  fetchNotes: async () => {
    try {
      const data = await noteService.getAllNotes();
      set({ notes: data });
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  },

  addNote: async (noteData) => {
    try {
      const newNote = await noteService.createNote(noteData);
      set((state) => ({ notes: [newNote, ...state.notes] }));
      return newNote; // Return so the UI can auto-select it
    } catch (error) {
      console.error("Error adding note:", error);
    }
  },

  updateNote: async (id, noteData) => {
    try {
      const updatedNote = await noteService.updateNote(id, noteData);
      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === id ? updatedNote : note,
        ),
      }));
    } catch (error) {
      console.error("Error updating note:", error);
    }
  },

  deleteNote: async (id) => {
    try {
      await noteService.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((note) => note._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  },

  // --- NOTE FOLDER ACTIONS ---
  fetchNoteFolders: async () => {
    try {
      const data = await noteFolderService.getAllFolders();
      set({ noteFolders: data });
    } catch (error) {
      console.error("Error fetching note folders:", error);
    }
  },

  addNoteFolder: async (folderName) => {
    try {
      const newFolder = await noteFolderService.createFolder({ folderName });
      set((state) => ({
        noteFolders: [...state.noteFolders, newFolder].sort((a, b) =>
          a.folderName.localeCompare(b.folderName),
        ),
      }));
      return newFolder;
    } catch (error) {
      console.error("Error adding note folder:", error);
    }
  },

  updateNoteFolder: async (id, folderName) => {
    try {
      const updatedFolder = await noteFolderService.updateFolder(id, {
        folderName,
      });
      set((state) => ({
        noteFolders: state.noteFolders
          .map((folder) => (folder._id === id ? updatedFolder : folder))
          .sort((a, b) => a.folderName.localeCompare(b.folderName)),
      }));
      // Because the backend cascaded the updates to all notes, we need to refresh our frontend notes!
      get().fetchNotes();
    } catch (error) {
      console.error("Error updating note folder:", error);
    }
  },

  deleteNoteFolder: async (id) => {
    try {
      await noteFolderService.deleteFolder(id);
      set((state) => ({
        noteFolders: state.noteFolders.filter((folder) => folder._id !== id),
      }));
      // Because the backend deleted all notes inside the folder, we need to refresh our frontend notes!
      get().fetchNotes();
    } catch (error) {
      console.error("Error deleting note folder:", error);
    }
  },
}));
