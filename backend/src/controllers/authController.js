import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper function to generate the VIP pass
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Registration attempt for: ${email}`);

    if (!name || !email || !password) {
      console.error("Registration failed: Missing required fields");
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error(`Registration failed: User already exists (${email})`);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    console.log(`User created successfully: ${user._id}`);

    const token = generateToken(user._id);
    console.log("Token generated successfully");

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalFocusSeconds: user.totalFocusSeconds || 0,
      token: token,
    });
  } catch (error) {
    console.error("CRITICAL REGISTRATION ERROR:", error);
    res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        totalFocusSeconds: user.totalFocusSeconds || 0,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add time to total focus
// @route   PATCH /api/auth/focus
export const addFocusTime = async (req, res) => {
  try {
    const { focusSeconds } = req.body;
    console.log(`Backend received addFocusTime request: ${focusSeconds} seconds for user ${req.user._id}`);
    if (!focusSeconds || typeof focusSeconds !== 'number') {
      console.log("Invalid focus time received:", focusSeconds);
      return res.status(400).json({ message: "Invalid focus time" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalFocusSeconds = (user.totalFocusSeconds || 0) + focusSeconds;
    await user.save();

    res.json({ totalFocusSeconds: user.totalFocusSeconds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
