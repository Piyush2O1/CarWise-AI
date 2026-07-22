const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);


const protect = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "You can access this protected route 🔐",
    userId: req.userId,
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CarWise AI Backend is running 🚗🤖",
  });
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});