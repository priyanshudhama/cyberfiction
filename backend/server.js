const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

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
  .then(() => {
    mongoConnected = true;
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.warn("MongoDB not connected, using JSON fallback");
  });

/* =======================
   MONGODB USER MODEL
======================= */
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

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
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  /* ---- USE MONGODB IF AVAILABLE ---- */
  if (mongoConnected) {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      username: name,
      email,
      password: hashedPassword
    });

    return res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }

  /* ---- JSON FALLBACK ---- */
  const users = readUsers();
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const newUser = {
    id: Date.now(),
    username: name,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  writeUsers(users);

  res.json({
    message: "Signup successful",
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
});

/* =======================
   LOGIN
======================= */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing credentials" });

  /* ---- USE MONGODB IF AVAILABLE ---- */
  if (mongoConnected) {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    return res.json({
      message: "Login success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }

  /* ---- JSON FALLBACK ---- */
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    message: "Login success",
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
