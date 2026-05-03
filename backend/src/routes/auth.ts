import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDB, ObjectId } from "../lib/mongodb.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/auth/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const db = await getDB();
    const existingUser = await db.collection("users").findOne({ email: parsed.data.email });
    
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    
    const result = await db.collection("users").insertOne({
      email: parsed.data.email,
      password: hashedPassword,
      fullName: parsed.data.fullName,
      createdAt: new Date(),
    });

    const token = generateToken(result.insertedId.toString());
    
    res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: parsed.data.email,
        fullName: parsed.data.fullName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = await getDB();
    const user = await db.collection("users").findOne({ email: parsed.data.email });
    
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password as string);
    
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());
    
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
