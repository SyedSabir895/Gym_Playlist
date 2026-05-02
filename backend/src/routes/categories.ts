import { Router } from "express";
import { getDB } from "../lib/mongodb.js";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const db = await getDB();
    const categories = await db.collection("videos").aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { name: 1 } },
    ]).toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
