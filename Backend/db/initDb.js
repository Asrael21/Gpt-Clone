import db from "./db.config.js";

export async function initDb() {
  try {
    // 1. Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create conversations table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        token_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Add user_id column if missing
    const [cols] = await db.execute("SHOW COLUMNS FROM conversations LIKE 'user_id'");
    if (cols.length === 0) {
      await db.execute("ALTER TABLE conversations ADD COLUMN user_id BIGINT UNSIGNED NULL");
      console.log("Added 'user_id' column to conversations table");
    }

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
}

export default initDb;
