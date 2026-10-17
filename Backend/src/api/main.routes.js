import express from "express";
import chatRouter from "./chat/chat.routes.js";
import authRouter from "./auth/auth.routes.js";

const mainRouter = express.Router();

// /api/auth
mainRouter.use("/auth", authRouter);

// /api/chat
mainRouter.use("/chat", chatRouter);

export default mainRouter;
