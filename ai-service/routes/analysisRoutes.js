const express = require("express");

const {
  analyzeContract,
} = require("../controllers/analysisController");

const router = express.Router();

router.post("/analyze", analyzeContract);

module.exports = router;