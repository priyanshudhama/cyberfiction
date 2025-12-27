const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");


const app = express(); // ✅ app MUST be created first
const PORT = process.env.PORT || 5000;

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== DATA FILE ===== */
const USERS_FILE = path.join(__dirname, "data", "users.json");

/* ===== HELPERS ===== */
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }

  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/* ===== TEST ROUTE ===== */
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "API working" });
});

/* ===== SIGNUP ===== */
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const users = readUsers();

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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


/* ===== LOGIN ===== */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

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
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});


/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
