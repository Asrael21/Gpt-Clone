import express from "express";
import {
  createConversationController,
  getConversationController,
  clearConversationController,
} from "./controller/chat.controller.js";
import { optionalAuth } from "../../middleware/auth.middleware.js";

const chatRouter = express.Router();

// /api/chat/conversations
chatRouter.post("/conversations", optionalAuth, createConversationController);
chatRouter.get("/conversations", optionalAuth, getConversationController);
chatRouter.delete("/conversations", optionalAuth, clearConversationController);

export default chatRouter;