import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// Ensure DB is connected before handling API requests (cached for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({ message: "Service temporarily unavailable" });
  }
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

export default app;
