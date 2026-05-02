import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // NEW: Added for Authentication
    password: { type: String, required: true },

    // EXISTING: Your learning metrics safely kept intact!
    streakCount: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalLearningHours: { type: Number, default: 0 },
    totalFocusSeconds: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// NEW: Automatically hash the password before saving it to the database
userSchema.pre("save", async function () {
  // If the password hasn't been changed (e.g., just updating totalLearningHours), skip hashing
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// NEW: Helper method to compare passwords when logging in
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
