import db from "../../../../db/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "gptclone_jwt_secret_token_2026_secure";
const JWT_EXPIRES_IN = "7d";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function registerService({ username, email, password }) {
  if (!username || username.trim().length < 3) {
    const error = new Error("Username must be at least 3 characters long.");
    error.status = 400;
    throw error;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Please provide a valid email address.");
    error.status = 400;
    throw error;
  }

  if (!password || password.length < 6) {
    const error = new Error("Password must be at least 6 characters long.");
    error.status = 400;
    throw error;
  }

  // Check if username or email already exists
  const [existing] = await db.execute(
    "SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username.trim(), email.trim().toLowerCase()]
  );

  if (existing.length > 0) {
    const isUsername = existing[0].username.toLowerCase() === username.trim().toLowerCase();
    const error = new Error(
      isUsername ? "This username is already taken." : "An account with this email already exists."
    );
    error.status = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username.trim(), email.trim().toLowerCase(), hashedPassword]
  );

  const user = {
    id: result.insertId,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    avatar: null,
  };

  const token = generateToken(user);

  return {
    user,
    token,
  };
}

export async function loginService({ identifier, password }) {
  if (!identifier || !identifier.trim()) {
    const error = new Error("Email or username is required.");
    error.status = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Password is required.");
    error.status = 400;
    throw error;
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const [rows] = await db.execute(
    "SELECT id, username, email, password, avatar FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
    [cleanIdentifier, cleanIdentifier]
  );

  if (rows.length === 0) {
    const error = new Error("Invalid username/email or password.");
    error.status = 401;
    throw error;
  }

  const userRow = rows[0];
  const isMatch = await bcrypt.compare(password, userRow.password);

  if (!isMatch) {
    const error = new Error("Invalid username/email or password.");
    error.status = 401;
    throw error;
  }

  const user = {
    id: userRow.id,
    username: userRow.username,
    email: userRow.email,
    avatar: userRow.avatar,
  };

  const token = generateToken(user);

  return {
    user,
    token,
  };
}

export async function getCurrentUserService(userId) {
  const [rows] = await db.execute(
    "SELECT id, username, email, avatar, created_at FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return rows[0];
}
