const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "view"))); // Serve static files from 'public' directory

// API Routes
app.use("/api/org", authRoutes);

// Serve the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
