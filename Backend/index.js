import "dotenv/config";

import express from "express";
import db from "./db/db.config.js";
import cors from "cors";
import { errorHandler } from "./src/middleware/error.handler.js";

import mainRouter from "./src/api/main.routes.js";

const app = express();

app.use(
    cors({
        origin:"http://localhost:5174",
    }),
);

app.use(express.json());
app.use("/api", mainRouter);

// Final middleware for error handling 
app.use(errorHandler);

async function startServer() {
    try {
        const connection = await db.getConnection();
        console.log("Db connected");
        connection.release();

        app.listen(3123,err =>{
            if (err) {
                throw err;
            }
            console.log("Server is running on port http://localhost:3123");
        });
    }catch(error){
        console.error("Error starting server:",error.message);
    }
}

startServer();

