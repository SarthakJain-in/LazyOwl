import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Password omitted for now until we add authentication
  streakCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  totalLearningHours: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

export default mongoose.model('User', userSchema);