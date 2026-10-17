import express from "express";
import {
  registerController,
  loginController,
  meController,
} from "./controller/auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post("/register", registerController);

// POST /api/auth/login
authRouter.post("/login", loginController);

// GET /api/auth/me
authRouter.get("/me", requireAuth, meController);

export default authRouter;
