import path from "path";
import express from "express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import app from "./app.js";

const __dirname = path.resolve();

// Serve built frontend locally / on traditional Node hosts (not on Vercel)
if (ENV.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("Error starting the server", error);
    process.exit(1);
  }
};

startServer();
