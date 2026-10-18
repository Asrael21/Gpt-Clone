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

let isDbConnected = false;

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// API health route for deployment health checks
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isDbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api", mainRouter);

// Serve frontend static build if it exists
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Catch-all SPA fallback middleware
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

// Attempt database connection and schema initialization
async function connectAndInitDatabase(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const isUrlSet = !!(process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_URL);
      const host = process.env.MYSQLHOST || process.env.DB_HOST || "localhost";
      const user = process.env.MYSQLUSER || process.env.DB_USER || "(not set)";
      const database = process.env.MYSQLDATABASE || process.env.DB_DATABASE || "(not set)";
      console.log(`[DB] Attempting MySQL connection (usingUrl: ${isUrlSet}, host: ${host}, user: ${user}, db: ${database}) [attempt ${attempt}/${retries}]...`);

      const connection = await db.getConnection();
      console.log("Database connected successfully!");
      connection.release();

      await initDb();
      isDbConnected = true;
      return;
    } catch (error) {
      console.error(`[DB] Connection attempt ${attempt} failed:`, error.code || error.sqlMessage || error.message || error);
      if (attempt < retries) {
        console.log(`[DB] Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.warn(
          "\n⚠️ WARNING: Database connection failed after multiple attempts.\n" +
          "If deploying to Railway, please ensure you have added a MySQL service or configured:\n" +
          "  - MYSQLHOST (or DB_HOST)\n" +
          "  - MYSQLUSER (or DB_USER)\n" +
          "  - MYSQLPASSWORD (or DB_PASSWORD)\n" +
          "  - MYSQLDATABASE (or DB_DATABASE)\n" +
          "  - MYSQLPORT (or DB_PORT)\n" +
          "in your Railway service Variables tab.\n"
        );
      }
    }
  }
}

// Start HTTP server immediately so Railway container remains healthy and doesn't crash
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running and listening on port ${PORT}`);
  // Connect to database in background
  connectAndInitDatabase();
});
