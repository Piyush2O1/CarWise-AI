const express = require("express");
const cors = require("cors");
require("dotenv").config();

const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api", analysisRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CarWise AI Service is running 🤖",
  });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`AI Service running on http://localhost:${PORT}`);
});