const { generateContractAnalysis } = require("../services/geminiService");

const analyzeContract = async (req, res) => {
  try {
    const { contractText } = req.body;

    if (!contractText) {
      return res.status(400).json({
        success: false,
        message: "Contract text is required",
      });
    }

    const rawText = await generateContractAnalysis(contractText);
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("Model output did not contain a JSON object");
    }

    const jsonSubstring = cleanedText.slice(firstBrace, lastBrace + 1);

    let analysis;
    try {
      analysis = JSON.parse(jsonSubstring);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON. Raw output:", cleanedText);
      throw parseErr;
    }

    const { scoreAnalysis } = require("../services/riskScoring");
    const scoreData = scoreAnalysis(analysis);

    res.json({
      success: true,
      analysis,
      score: scoreData,
      source: "gemini",
    });
  } catch (error) {
    console.error("Analysis Error:", error);

    const statusCode = error.status || 500;
    let message = error.message || "Something went wrong while analyzing the contract.";

    if (statusCode === 503) {
      message = "The AI model is currently busy. Please try again in a few seconds.";
    } else if (statusCode === 429) {
      message = "API usage limit reached. Please try again later.";
    } else if (/Gemini API key|GEMINI_API_KEYS|configuration/i.test(message)) {
      message = "The AI service is not configured correctly. Check GEMINI_API_KEYS in ai-service/.env.";
    } else if (statusCode === 404) {
      message = "The selected AI model is not available.";
    } else if (/network/i.test(message)) {
      message = "Unable to connect to the AI service.";
    } else if (message === "Contract text is required") {
      message = "Contract text is required";
    } else {
      message = "Something went wrong while analyzing the contract.";
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  analyzeContract,
};

