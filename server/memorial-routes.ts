import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Resolve project root
const projectRoot = import.meta.dirname.endsWith(path.join("dist", "server"))
  ? path.resolve(import.meta.dirname, "..", "..")
  : path.resolve(import.meta.dirname, "..");

// Ensure directories exist
const uploadsDir = path.resolve(projectRoot, "uploads", "memorial");
const dataDir = path.resolve(projectRoot, "data");
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const tributesFile = path.join(dataDir, "tributes.json");

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

interface Tribute {
  id: string;
  name: string;
  relationship: string;
  message: string;
  photoUrl: string | null;
  createdAt: string;
}

function loadTributes(): Tribute[] {
  try {
    if (fs.existsSync(tributesFile)) {
      return JSON.parse(fs.readFileSync(tributesFile, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to load tributes file:", err);
  }
  return [];
}

function saveTributes(tributes: Tribute[]) {
  fs.writeFileSync(tributesFile, JSON.stringify(tributes, null, 2));
}

// GET all tributes (newest first)
router.get("/api/memorial/tributes", (_req, res) => {
  const tributes = loadTributes();
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

  const tributes = loadTributes();
  tributes.push(tribute);
  saveTributes(tributes);

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
