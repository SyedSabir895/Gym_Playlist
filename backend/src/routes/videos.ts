import { Router } from "express";
import { z } from "zod";
import { getDB, ObjectId } from "../lib/mongodb.js";

const router = Router();

const CreateVideoBody = z.object({
  youtubeUrl: z.string().url(),
  title: z.string().min(1),
  category: z.string().min(1),
  notes: z.string().optional(),
});

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function toVideo(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    youtubeUrl: doc.youtubeUrl as string,
    youtubeId: doc.youtubeId as string,
    title: doc.title as string,
    category: doc.category as string,
    notes: doc.notes as string | undefined,
    thumbnailUrl: `https://img.youtube.com/vi/${doc.youtubeId}/hqdefault.jpg`,
    createdAt: doc.createdAt as Date,
  };
}

router.get("/videos/stats", async (_req, res) => {
  try {
    const db = await getDB();
    const total = await db.collection("videos").countDocuments();
    const byCategory = await db.collection("videos").aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).toArray();
    res.json({ total, byCategory });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/videos", async (req, res) => {
  try {
    const db = await getDB();
    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    const docs = await db.collection("videos").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(toVideo));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.post("/videos", async (req, res) => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const youtubeId = extractYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    res.status(400).json({ error: "Invalid YouTube URL." });
    return;
  }
  try {
    const db = await getDB();
    const doc = {
      youtubeUrl: parsed.data.youtubeUrl,
      youtubeId,
      title: parsed.data.title,
      category: parsed.data.category,
      notes: parsed.data.notes ?? null,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      createdAt: new Date(),
    };
    const result = await db.collection("videos").insertOne(doc);
    res.status(201).json(toVideo({ ...doc, _id: result.insertedId }));
  } catch (err) {
    res.status(500).json({ error: "Failed to save video" });
  }
});

router.get("/videos/:id", async (req, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const db = await getDB();
    const doc = await db.collection("videos").findOne({ _id: objectId });
    if (!doc) { res.status(404).json({ error: "Video not found" }); return; }
    res.json(toVideo(doc as Record<string, unknown>));
  } catch {
    res.status(400).json({ error: "Invalid video ID" });
  }
});

router.delete("/videos/:id", async (req, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const db = await getDB();
    const result = await db.collection("videos").deleteOne({ _id: objectId });
    if (result.deletedCount === 0) { res.status(404).json({ error: "Video not found" }); return; }
    res.json({ success: true, message: "Video deleted successfully" });
  } catch {
    res.status(400).json({ error: "Invalid video ID" });
  }
});

export default router;
