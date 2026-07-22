import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(import.meta.dirname, "..", "uploads", "memorial");
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, `tribute-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// In-memory tribute store
interface Tribute {
  id: string;
  name: string;
  relationship: string;
  message: string;
  photoUrl: string | null;
  createdAt: string;
}

const tributes: Tribute[] = [];

// GET all tributes (newest first)
router.get("/api/memorial/tributes", (_req, res) => {
  res.json(tributes.slice().reverse());
});

// POST a new tribute
router.post("/api/memorial/tributes", upload.single("photo"), (req, res) => {
  const { name, relationship, message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "A message is required" });
  }

  const tribute: Tribute = {
    id: `tribute-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name?.trim() || "Anonymous",
    relationship: relationship?.trim() || "",
    message: message.trim(),
    photoUrl: req.file ? `/api/memorial/photos/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
  };

  tributes.push(tribute);
  res.status(201).json(tribute);
});

// Serve uploaded photos
router.get("/api/memorial/photos/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Photo not found" });
  }
  res.sendFile(filePath);
});

export default router;
