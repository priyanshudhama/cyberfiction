require("dotenv").config();
require("dotenv").config();
const connectDB = require("./db");

connectDB();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path"); // 
/* =======================
   APP SETUP
======================= */
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =======================
   MONGODB CONNECTION
======================= */
let mongoConnected = false;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err.message));

/* =======================
   USER MODEL (SINGLE SOURCE)
======================= */
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

/* =======================
   JSON FILE STORAGE (FALLBACK)
======================= */
const USERS_FILE = path.join(__dirname, "data", "users.json");

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/* =======================
   TEST ROUTE
======================= */
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "API working" });
});

/* =======================
   SIGNUP
======================= */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: name,
      email,
      password: hashedPassword
    });

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   LOGIN
======================= */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
