import { GoogleGenerativeAI } from "@google/generative-ai";
import Task from "../models/Task.js";
import Module from "../models/Module.js";
import Roadmap from "../models/Roadmap.js";

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
    res.status(200).json(roadmaps);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching roadmaps", error: error.message });
  }
};

// @desc    Create a new roadmap
// @route   POST /api/roadmaps
export const createRoadmap = async (req, res) => {
  try {
    const { title, category } = req.body;

    // Hardcoding a dummy userId until we implement JWT Authentication
    const dummyUserId = "60d0fe4f5311236168a109ca";

    const newRoadmap = await Roadmap.create({
      userId: dummyUserId,
      title,
      category,
    });

    res.status(201).json(newRoadmap);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating roadmap", error: error.message });
  }
};

// @desc    Generate a new roadmap with AI
// @route   POST /api/roadmaps/generate-with-ai
export const generateRoadmapWithAI = async (req, res) => {
  try {
    const { topic, category } = req.body;
    const dummyUserId = "60d0fe4f5311236168a109ca"; // Still using our dummy user for now

    // 1. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. The Prompt Engineering
    const prompt = `
      You are an expert technical mentor. Create a learning roadmap for the topic: "${topic}".
      Break it down into 3 logical modules. 
      For each module, provide 2 atomic, actionable learning tasks.
      
      You MUST respond ONLY with a valid, parseable JSON object in this exact format, with no markdown formatting, no backticks, and no extra text:
      {
        "title": "Mastering ${topic}",
        "modules": [
          {
            "moduleName": "Name of Module",
            "tasks": [
              { "title": "Specific task title", "durationMinutes": 30 },
              { "title": "Another task", "durationMinutes": 45 }
            ]
          }
        ]
      }
    `;

    // 3. Call the AI
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up the response in case Gemini added markdown code blocks
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const aiData = JSON.parse(cleanJson);

    // 4. Save the Roadmap to MongoDB
    const newRoadmap = await Roadmap.create({
      userId: dummyUserId,
      title: aiData.title,
      category: category || "Generated Path",
    });

    // 5. Save all the generated Modules to MongoDB
    const modulesToInsert = aiData.modules.map((mod, index) => ({
      roadmapId: newRoadmap._id,
      title: mod.moduleName,
      order: index,
    }));
    const insertedModules = await Module.insertMany(modulesToInsert);

    // 6. Save all the generated Tasks to MongoDB, linking them to the Roadmap and new Modules
    const tasksToInsert = [];
    aiData.modules.forEach((mod, modIndex) => {
      const parentModule = insertedModules[modIndex];
      mod.tasks.forEach((task, taskIndex) => {
        tasksToInsert.push({
          roadmapId: newRoadmap._id,
          title: task.title,
          moduleId: parentModule._id,
          order: taskIndex,
          durationMinutes: task.durationMinutes,
        });
      });
    });

    await Task.insertMany(tasksToInsert);

    // Return the completed roadmap with its ID
    res.status(201).json({
      message: "AI Roadmap generated successfully",
      roadmap: newRoadmap,
      tasksGenerated: tasksToInsert.length,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate roadmap", error: error.message });
  }
};

// @desc    Update a roadmap
// @route   PUT /api/roadmaps/:id
export const updateRoadmap = async (req, res) => {
  try {
    const { title, category } = req.body;
    const updatedRoadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      { $set: { title, category } },
      { new: true, runValidators: true }
    );
    if (!updatedRoadmap) return res.status(404).json({ message: "Roadmap not found" });
    res.status(200).json(updatedRoadmap);
  } catch (error) {
    res.status(400).json({ message: "Error updating roadmap", error: error.message });
  }
};

// @desc    Toggle whether a roadmap is pinned/active on the dashboard
// @route   PATCH /api/roadmaps/:id/active
export const toggleRoadmapActive = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    roadmap.isActive = !roadmap.isActive;
    const updatedRoadmap = await roadmap.save();

    res.status(200).json(updatedRoadmap);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error toggling roadmap status", error: error.message });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the roadmap first to make sure it exists
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // 2. THE CASCADE: Delete all tasks and modules belonging to this roadmap
    await Task.deleteMany({ roadmapId: id });
    await Module.deleteMany({ roadmapId: id });

    // 3. Delete the roadmap itself
    await roadmap.deleteOne();

    res
      .status(200)
      .json({ message: "Roadmap and all associated tasks deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting roadmap", error: error.message });
  }
};
