import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db/db.config.js";
import { initDb } from "./db/initDb.js";
import { errorHandler } from "./src/middleware/error.handler.js";
import mainRouter from "./src/api/main.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3777;

// Enable CORS
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

// Main API routes
app.use("/api", mainRouter);

// Serve frontend static build if it exists
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Catch-all SPA fallback middleware (compatible with Express 4, 5, and Node 20-24)
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = path.join(frontendDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

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
