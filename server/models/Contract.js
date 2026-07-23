const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "uploaded",
        "extracted",
        "processing",
        "analysis_failed",
        "analyzed",
      ],
      default: "uploaded",
    },

    riskLevel: {
      type: String,
      default: null,
    },

    contractStatus: {
      type: String,
      default: null,
    },

    riskScore: {
      type: Number,
      default: null,
    },

    safetyScore: {
      type: Number,
      default: null,
    },

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Contract",
  contractSchema
);