import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { connectDB } from "./lib/mongodb.js";

const app = express();

app.use(cors({
  exposedHeaders: ["x-google-token"],
  allowedHeaders: ["Content-Type", "Authorization", "x-google-token"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB on startup:", err.message);
});

app.use("/api", router);
app.use("/uploads", express.static("uploads"));

export default app;
