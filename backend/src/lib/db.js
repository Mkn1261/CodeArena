import mongoose from "mongoose";

import { ENV } from "./env.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (!ENV.DB_URL) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(ENV.DB_URL)
      .then((conn) => {
        console.log("Connected to MongoDB:", conn.connection.host);
        return conn;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("Error connecting to MongoDB", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
