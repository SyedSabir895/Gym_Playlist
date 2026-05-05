import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import { getDB, ObjectId } from "../lib/mongodb.js";
import { verifyToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Configure multer for temporary storage before uploading to Drive
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

const CreateVideoBody = z.object({
  youtubeUrl: z.string().url().optional(),
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
  const isLocal = !!doc.googleFileId;
  return {
    id: String(doc._id),
    youtubeUrl: doc.youtubeUrl as string | undefined,
    youtubeId: doc.youtubeId as string | undefined,
    googleFileId: doc.googleFileId as string | undefined,
    title: doc.title as string,
    category: doc.category as string,
    notes: doc.notes as string | undefined,
    thumbnailUrl: isLocal 
      ? `https://drive.google.com/thumbnail?id=${doc.googleFileId}&sz=w600` 
      : `https://img.youtube.com/vi/${doc.youtubeId}/hqdefault.jpg`,
    videoUrl: isLocal 
      ? doc.googleFileId as string // We will handle this on the frontend
      : doc.youtubeUrl as string,
    isLocal,
    createdAt: doc.createdAt as Date,
    userId: String(doc.userId),
  };
}

router.post("/videos", verifyToken, upload.single("videoFile"), async (req: AuthRequest, res) => {
  try {
    const headerToken = req.headers["x-google-token"] as string;
    const bodyToken = req.body.googleToken as string;
    const googleToken = (bodyToken || headerToken)?.trim();

    if (googleToken) {
      console.log(`Received Google Token: ${googleToken.substring(0, 10)}... (length: ${googleToken.length})`);
    }

    const parsed = CreateVideoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { youtubeUrl, title, category, notes } = parsed.data;
    let youtubeId: string | null = null;
    let googleFileId: string | null = null;

    if (req.file) {
      console.log("Checking googleToken for file upload...");
      if (!googleToken) {
        console.error("CRITICAL: googleToken is missing in the request headers!");
        res.status(400).json({ error: "Google access token is missing. Please log out and sign in with Google again." });
        return;
      }
      console.log("googleToken found (length: " + googleToken.length + ")");

      // Upload to Google Drive
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: googleToken });
      const drive = google.drive({ version: "v3", auth });

      const fileMetadata = {
        name: `${title}-${Date.now()}`,
        mimeType: req.file.mimetype,
      };
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };

      const driveFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      googleFileId = driveFile.data.id || null;

      // Set permission to "anyone with link" so it can be viewed in the app
      if (googleFileId) {
        try {
          console.log(`Attempting to set public permissions for file: ${googleFileId}`);
          await drive.permissions.create({
            fileId: googleFileId,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          });
          console.log("Permissions set to public successfully.");
        } catch (permError) {
          console.error("Error setting public permissions:", permError);
          // We don't fail the whole request, but we log the error
        }
      }

      // Clean up local file
      fs.unlinkSync(req.file.path);
    } else if (youtubeUrl) {
      youtubeId = extractYoutubeId(youtubeUrl);
      if (!youtubeId) {
        res.status(400).json({ error: "Invalid YouTube URL." });
        return;
      }
    } else {
      res.status(400).json({ error: "Either a YouTube URL or a video file is required." });
      return;
    }

    const db = await getDB();
    const doc = {
      youtubeUrl: youtubeUrl || null,
      youtubeId: youtubeId || null,
      googleFileId: googleFileId || null,
      title,
      category,
      notes: notes ?? null,
      userId: new ObjectId(req.userId!),
      createdAt: new Date(),
    };
    const result = await db.collection("videos").insertOne(doc);
    res.status(201).json(toVideo({ ...doc, _id: result.insertedId }));
  } catch (err) {
    console.error("Save video error:", err);
    res.status(500).json({ error: "Failed to save video to Google Drive" });
  }
});

router.get("/videos/stats", verifyToken, async (req: AuthRequest, res) => {
  try {
    const db = await getDB();
    const filter = { userId: new ObjectId(req.userId!) };
    const total = await db.collection("videos").countDocuments(filter);
    const byCategory = await db.collection("videos").aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).toArray();
    res.json({ total, byCategory });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/videos", verifyToken, async (req: AuthRequest, res) => {
  try {
    const db = await getDB();
    const filter: Record<string, unknown> = { userId: new ObjectId(req.userId!) };
    if (req.query.category) filter.category = req.query.category;
    const docs = await db.collection("videos").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(toVideo));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

router.get("/videos/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const db = await getDB();
    const doc = await db.collection("videos").findOne({ 
      _id: objectId,
      userId: new ObjectId(req.userId!)
    });
    if (!doc) { res.status(404).json({ error: "Video not found" }); return; }
    res.json(toVideo(doc as Record<string, unknown>));
  } catch {
    res.status(400).json({ error: "Invalid video ID" });
  }
});

router.delete("/videos/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const objectId = new ObjectId(req.params.id);
    const db = await getDB();
    const result = await db.collection("videos").deleteOne({ 
      _id: objectId,
      userId: new ObjectId(req.userId!)
    });
    if (result.deletedCount === 0) { res.status(404).json({ error: "Video not found or unauthorized" }); return; }
    res.json({ success: true, message: "Video deleted successfully" });
  } catch {
    res.status(400).json({ error: "Invalid video ID" });
  }
});

export default router;
