import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import Task from "../models/Task.js";
import Module from "../models/Module.js";
import Roadmap from "../models/Roadmap.js";

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

    const newRoadmap = await Roadmap.create({
      userId: req.user._id,
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
      userId: req.user._id,
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

// @desc    Import a roadmap from a PDF file
// @route   POST /api/roadmaps/import-pdf
export const importRoadmapFromPDF = async (req, res) => {
  try {
    // 1. Validate file exists
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    const { category } = req.body;

    // 2. Send the PDF directly to Gemini as multimodal input (no text extraction needed!)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert the PDF buffer to base64 for Gemini's inline data format
    const pdfBase64 = req.file.buffer.toString("base64");

    const prompt = `
      You are an expert at parsing learning roadmaps. I have uploaded a PDF document that contains a learning roadmap.
      
      Your job is to analyze this PDF and convert its content into a structured JSON format with modules and tasks.
      
      Rules:
      - Extract the main title of the roadmap from the PDF. If no clear title exists, create a descriptive one based on the content.
      - Group related items into logical modules (sections/chapters).
      - Each module should contain multiple tasks (specific learning items or action steps).
      - For each task, provide a brief description explaining what the task involves or what the learner will achieve.
      - For each task, estimate a realistic duration in minutes based on the complexity and type of task:
        * Simple reading/review tasks: 15-30 minutes
        * Hands-on coding exercises: 30-60 minutes
        * Complex project tasks: 60-120 minutes
        * Theory/concept study: 20-45 minutes
      - If the PDF includes descriptions for tasks, use those. Otherwise, generate a helpful 1-2 sentence description.
      - Be thorough: capture ALL items from the PDF, do not skip anything.
      - If the structure is unclear, do your best to logically group related items.
      
      You MUST respond ONLY with a valid, parseable JSON object in this exact format, with no markdown formatting, no backticks, and no extra text:
      {
        "title": "Roadmap Title",
        "modules": [
          {
            "moduleName": "Module/Section Name",
            "tasks": [
              { "title": "Specific task", "description": "A brief description of what this task involves.", "durationMinutes": 30 },
              { "title": "Another task", "description": "What the learner will do or achieve.", "durationMinutes": 45 }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64,
        },
      },
    ]);
    const responseText = result.response.text();

    // Clean up in case Gemini added markdown code blocks
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiData;
    try {
      aiData = JSON.parse(cleanJson);
    } catch (parseError) {
      return res.status(500).json({
        message: "Failed to parse the PDF content into a valid roadmap structure. Please ensure your PDF follows the recommended format.",
        error: parseError.message,
      });
    }

    // 4. Save the Roadmap to MongoDB (same pattern as generateRoadmapWithAI)
    const newRoadmap = await Roadmap.create({
      userId: req.user._id,
      title: aiData.title,
      category: category || "Imported Path",
    });

    // 5. Save Modules
    const modulesToInsert = aiData.modules.map((mod, index) => ({
      roadmapId: newRoadmap._id,
      title: mod.moduleName,
      order: index,
    }));
    const insertedModules = await Module.insertMany(modulesToInsert);

    // 6. Save Tasks linked to their Modules
    const tasksToInsert = [];
    aiData.modules.forEach((mod, modIndex) => {
      const parentModule = insertedModules[modIndex];
      mod.tasks.forEach((task, taskIndex) => {
        tasksToInsert.push({
          roadmapId: newRoadmap._id,
          title: task.title,
          description: task.description || "",
          moduleId: parentModule._id,
          order: taskIndex,
          durationMinutes: task.durationMinutes || 30,
        });
      });
    });

    await Task.insertMany(tasksToInsert);

    // File buffer is automatically garbage collected (no disk cleanup needed)

    res.status(201).json({
      message: "Roadmap imported from PDF successfully!",
      roadmap: newRoadmap,
      modulesCreated: insertedModules.length,
      tasksCreated: tasksToInsert.length,
    });
  } catch (error) {
    console.error("PDF Import Error:", error);
    res
      .status(500)
      .json({ message: "Failed to import roadmap from PDF", error: error.message });
  }
};

// @desc    Download a sample PDF template
// @route   GET /api/roadmaps/sample-pdf
export const downloadSamplePDF = async (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sample-roadmap-template.pdf"'
    );

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // --- Title ---
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Mastering React.js", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Sample Roadmap Template — LazyOwl", { align: "center" });
    doc.moveDown(1.5);

    // --- Instructions Box ---
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text("HOW TO USE THIS TEMPLATE:", { underline: true });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#555555")
      .text("1. Replace the content below with your own roadmap modules and tasks.")
      .text("2. Keep the structure: Module headings → task bullet points → task descriptions.")
      .text("3. Add a description below each task to explain what the learner should do.")
      .text("4. Optionally include time estimates (e.g., \"30 min\" or \"1 hour\").")
      .text("5. Save as PDF and upload to LazyOwl. The AI will parse it automatically!")
      .text("6. You can add as many modules and tasks as you need.");
    doc.moveDown(1.5);

    // Horizontal line
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(1);

    // Helper to render a task with description
    const renderTask = (title, description, duration) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text(`• ${title} — ${duration}`);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`  ${description}`);
      doc.moveDown(0.3);
    };

    // --- Module 1 ---
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("Module 1: React Fundamentals");
    doc.moveDown(0.5);
    renderTask("Understand JSX syntax and expressions", "Learn how JSX combines HTML-like syntax with JavaScript expressions to create UI elements.", "20 min");
    renderTask("Create functional components and pass props", "Build reusable UI components and learn to pass data between them using props.", "30 min");
    renderTask("Handle events and conditional rendering", "Attach event handlers to elements and render different UI based on conditions.", "25 min");
    renderTask("Work with lists and keys", "Render dynamic lists of data using .map() and understand why keys are important for performance.", "20 min");
    doc.moveDown(0.5);

    // --- Module 2 ---
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("Module 2: State Management");
    doc.moveDown(0.5);
    renderTask("Learn useState hook for local state", "Manage component-level state that triggers re-renders when updated.", "30 min");
    renderTask("Implement useEffect for side effects", "Run code on mount, update, or unmount — fetch data, set up subscriptions, etc.", "45 min");
    renderTask("Build a controlled form component", "Create a form where React controls input values via state for validation and submission.", "40 min");
    renderTask("Lift state up between sibling components", "Move shared state to the nearest common parent so multiple children can access it.", "35 min");
    doc.moveDown(0.5);

    // --- Module 3 ---
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("Module 3: Routing & API Integration");
    doc.moveDown(0.5);
    renderTask("Set up React Router with nested routes", "Configure client-side routing with nested layouts using React Router v6+.", "30 min");
    renderTask("Fetch data from a REST API with useEffect", "Make HTTP requests on component mount and handle the response data.", "45 min");
    renderTask("Implement loading and error states", "Show spinners while data loads and display error messages when API calls fail.", "25 min");
    renderTask("Build a complete CRUD feature", "Create, read, update, and delete records with API integration and optimistic updates.", "90 min");
    doc.moveDown(0.5);

    // --- Module 4 ---
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("Module 4: Advanced Patterns");
    doc.moveDown(0.5);
    renderTask("Create custom hooks for reusable logic", "Extract common patterns like data fetching or form handling into reusable custom hooks.", "40 min");
    renderTask("Use useContext for global state management", "Share state across deeply nested components without prop drilling.", "35 min");
    renderTask("Optimize performance with useMemo and useCallback", "Prevent unnecessary re-renders by memoizing expensive computations and callback functions.", "45 min");
    renderTask("Deploy the application to Vercel", "Push your React app to production with Vercel's Git-based deployment workflow.", "30 min");
    doc.moveDown(1.5);

    // --- Footer ---
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999999")
      .text(
        "Tip: Your PDF doesn't have to match this format exactly. Our AI will intelligently parse modules and tasks from any reasonable structure!",
        { align: "center" }
      );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Sample PDF Error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate sample PDF", error: error.message });
  }
};
