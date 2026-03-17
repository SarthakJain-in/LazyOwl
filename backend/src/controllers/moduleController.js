import Module from "../models/Module.js";
import Task from "../models/Task.js";

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules", error: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const { roadmapId, title, order } = req.body;
    const newModule = await Module.create({ roadmapId, title, order: order || 0 });
    res.status(201).json(newModule);
  } catch (error) {
    res.status(400).json({ message: "Error creating module", error: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { title } = req.body;
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { $set: { title } },
      { new: true, runValidators: true }
    );
    if (!updatedModule) return res.status(404).json({ message: "Module not found" });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(400).json({ message: "Error updating module", error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: "Module not found" });
    
    // Delete all tasks in this module
    await Task.deleteMany({ moduleId: req.params.id });
    await module.deleteOne();
    
    res.status(200).json({ message: "Module and associated tasks deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting module", error: error.message });
  }
};

export const reorderModules = async (req, res) => {
  try {
    const { modules } = req.body; // Array of { _id, order }
    const bulkOps = modules.map((mod) => ({
      updateOne: {
        filter: { _id: mod._id },
        update: { order: mod.order },
      },
    }));

    if (bulkOps.length > 0) {
      await Module.bulkWrite(bulkOps);
    }
    res.status(200).json({ message: "Modules reordered successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error reordering modules", error: error.message });
  }
};
