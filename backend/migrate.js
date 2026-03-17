import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Task from "./src/models/Task.js";
import Module from "./src/models/Module.js";
import Roadmap from "./src/models/Roadmap.js";

dotenv.config();

const migrate = async () => {
  await connectDB();

  try {
    const tasks = await Task.find();
    console.log(`Found ${tasks.length} tasks to migrate`);

    const roadmaps = await Roadmap.find();
    console.log(`Found ${roadmaps.length} roadmaps to process`);

    for (const roadmap of roadmaps) {
      const roadmapTasks = tasks.filter(
        (t) => t.roadmapId.toString() === roadmap._id.toString()
      );

      // Find unique moduleNames
      const moduleNames = [...new Set(roadmapTasks.map((t) => t.moduleId ? "Unknown Module" : (t.get('moduleName') || "Old Tasks")))];

      let order = 0;
      for (const modName of moduleNames) {
        // Check if a module with this title already exists in the roadmap
        let module = await Module.findOne({
          roadmapId: roadmap._id,
          title: modName,
        });

        if (!module) {
          console.log(`Creating module: ${modName} for roadmap: ${roadmap.title}`);
          module = await Module.create({
            roadmapId: roadmap._id,
            title: modName,
            order: order++,
          });
        }

        // Update tasks that have this moduleName
        for (const task of roadmapTasks) {
          if (task.get('moduleName') === modName && !task.moduleId) {
            task.moduleId = module._id;
            await task.save();
            console.log(`Updated task ${task.title} with moduleId ${module._id}`);
          }
        }
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
