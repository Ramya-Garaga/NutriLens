
import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Image upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload an image file."));
    }
  },
});

// Test route
app.get("/", (req, res) => {
  res.send("NutriLens backend is running!");
});

// Food image upload route
app.post(
  "/api/recognize",
  upload.single("foodImage"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a food image.",
      });
    }

    res.json({
      message: "Image uploaded successfully!",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      nextStep: "Connect the food-recognition model.",
    });
  }
);

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be smaller than 5 MB."
          : err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message || "Something went wrong.",
    });
  }

  next();
});

// Start server
app.listen(PORT, () => {
  console.log(
    `NutriLens server running at http://localhost:${PORT}`
  );
});

