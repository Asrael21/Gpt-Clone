import "dotenv/config";

import express from "express";
import cors from "cors";
import db from "./db/db.config.js";
import { initDb } from "./db/initDb.js";
import { errorHandler } from "./src/middleware/error.handler.js";
import mainRouter from "./src/api/main.routes.js";

const app = express();
const PORT = process.env.PORT || 3777;

// Enable CORS for all origins in development
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// API health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

// Main routes
app.use("/api", mainRouter);

// Error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully");
    connection.release();

    // Initialize database schema (tables, columns)
    await initDb();

    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
  }
}

startServer();
