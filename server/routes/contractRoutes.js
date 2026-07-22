const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadContract,
  analyzeContract,
  getUserContracts,
   getContractById,
} = require("../controllers/contractController");

const router = express.Router();

router.get(
  "/",
  protect,
  getUserContracts
);

router.get(
  "/:id",
  protect,
  getContractById
);

router.post(
  "/upload",
  protect,
  upload.single("contract"),
  uploadContract
);

router.post(
  "/:id/analyze",
  protect,
  analyzeContract
);

module.exports = router;