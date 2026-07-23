const Contract = require("../models/Contract");
const extractTextFromPDF = require("../services/pdfService");
const axios = require("axios");
const { getRiskLevelFromSafetyScore } = require("../../shared/riskLevel");

const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:6000";

const uploadContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a contract file",
      });
    }

    // 1. PDF se text extract karo
    const extractedText = await extractTextFromPDF(req.file.path);

      console.log("EXTRACTED TEXT:", extractedText);

    // 2. Contract database me save karo
    const contract = await Contract.create({ 
      userId: req.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      extractedText,
      status: "extracted",
    });

    res.status(201).json({
      success: true,
      message: "Contract uploaded and text extracted successfully",
      contract,
    });
  } catch (error) {
    console.error("Upload Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getApiErrorMessage = (error) => {
  const status = error.response?.status || error.status || 500;
  const raw =
    error.response?.data?.message || error.response?.data || error.message || "";

  if (status === 503) {
    return "The AI model is currently busy. Please try again in a few seconds.";
  }

  if (status === 429 || /Too Many Requests/i.test(raw)) {
    return "API usage limit reached. Please try again later.";
  }

  if (status === 404 || /model not found|unsupported model|404/i.test(raw)) {
    return "The selected AI model is not available.";
  }

  if (
    /network/i.test(raw) ||
    error.code === "ECONNABORTED" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ENOTFOUND"
  ) {
    return "Unable to connect to the AI service.";
  }

  if (/gemini api key|gemini_api_keys|ai service is not configured/i.test(raw)) {
    return "The AI service is not configured correctly. Check GEMINI_API_KEYS in ai-service/.env.";
  }

  return "Something went wrong while analyzing the contract.";
};

const analyzeContract = async (req, res) => {
  let contract;

  try {
    const { id } = req.params;

    contract = await Contract.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    if (!contract.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Contract text has not been extracted yet",
      });
    }

    contract.status = "processing";
    await contract.save();

    // 3. AI service ko extracted text bhejo
    const aiResponse = await axios.post(`${aiServiceUrl}/api/analyze`, {
      contractText: contract.extractedText,
    });

    // 4. AI analysis database me save karo
    const normalizedAnalysis = aiResponse.data.analysis || {};
    const scoreData = aiResponse.data.score || {};
    const resolvedRiskScore = scoreData.riskScore ?? normalizedAnalysis.riskScore ?? null;
    const resolvedSafetyScore = scoreData.safetyScore ?? normalizedAnalysis.safetyScore ?? null;
    const computedRiskLevel = resolvedSafetyScore == null ? null : getRiskLevelFromSafetyScore(resolvedSafetyScore);
    const computedSafetyScore = resolvedSafetyScore ?? (resolvedRiskScore == null ? null : 100 - resolvedRiskScore);

    normalizedAnalysis.riskScore = resolvedRiskScore;
    normalizedAnalysis.safetyScore = computedSafetyScore;
    normalizedAnalysis.riskLevel = computedRiskLevel;
    normalizedAnalysis.contractStatus = computedRiskLevel;

    contract.analysis = normalizedAnalysis;
    contract.riskLevel = computedRiskLevel;
    contract.contractStatus = computedRiskLevel;
    contract.riskScore = resolvedRiskScore;
    contract.safetyScore = computedSafetyScore;
    contract.status = "analyzed";

    await contract.save();

    res.status(200).json({
      success: true,
      message: "Contract analyzed successfully",
      contractId: contract._id,
      analysis: contract.analysis,
    });
  } catch (error) {
    console.error(
      "Analysis Error:",
      error.response?.data || error.message,
      error.stack
    );

    if (contract) {
      try {
        contract.status = "analysis_failed";
        await contract.save();
      } catch (statusError) {
        console.error("Failed to update contract status:", statusError);
      }
    }

    const statusCode = error.response?.status || error.status || 500;

    res.status(statusCode).json({
      success: false,
      message: getApiErrorMessage(error),
    });
  }
};

const getUserContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      contracts,
    });
  } catch (error) {
    console.error("Get Contracts Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error("Get Contract Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadContract,
  analyzeContract,
  getUserContracts,
  getContractById,
};