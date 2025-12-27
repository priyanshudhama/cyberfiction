const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "cyberfiction_super_secret_key";

const express = require("express");
const cors = require("cors");
app.use(cors());


const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());
const fs = require("fs");
const path = require("path");


const USERS_FILE = path.join(__dirname, "data", "users.json");

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  // read users
  let users = [];
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    users = JSON.parse(data);
  } catch {
    users = [];
  }

  // check existing user
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword
  };

  users.push(newUser);

  // WRITE TO FILE
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.status(201).json({
    message: "Signup successful",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

// -------------------- TEMP USER STORE --------------------
// (Later we replace this with MongoDB)
const users = [];

// -------------------- TEST ROUTE --------------------
app.get("/test", (req, res) => {
  res.send("API is working");
});

// -------------------- SIGNUP --------------------
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

  // 🔐 STEP 1.3 — HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword
  };

  users.push(user);
  writeUsers(users);

  res.json({ message: "Signup successful" });
});

// -------------------- LOGIN --------------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🔐 STEP 1.4 — VERIFY PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🔐 STEP 1.5 — GENERATE JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});


// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
