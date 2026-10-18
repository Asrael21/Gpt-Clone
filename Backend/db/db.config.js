import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_URL;

const db = mysql.createPool(
  dbUrl
    ? dbUrl
    : {
        host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
        user: process.env.MYSQLUSER || process.env.DB_USER,
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
        database: process.env.MYSQLDATABASE || process.env.DB_DATABASE,
        port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      }
);

export default db;