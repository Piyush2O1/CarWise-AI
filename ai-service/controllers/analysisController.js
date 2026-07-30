const { generateContractAnalysis } = require("../services/geminiService");
let azureDocumentService;

try {
  azureDocumentService = require("../services/azureDocumentService");
} catch (err) {
  azureDocumentService = null;
}

const analyzeContract = async (req, res) => {
  try {
    const { contractText, documentUrl, documentBuffer, contentType } = req.body;

    if (!contractText && !documentUrl && !documentBuffer) {
      return res.status(400).json({
        success: false,
        message: "Contract text or document source is required",
      });
    }

    if ((documentUrl || documentBuffer) && !azureDocumentService) {
      return res.status(500).json({
        success: false,
        message:
          "Azure Document Intelligence is not configured. Ensure AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY are set in ai-service/.env.",
      });
    }

    if (documentUrl || documentBuffer) {
      const azureResult = await azureDocumentService.analyzeDocumentFromUrlOrBuffer(
        documentUrl || documentBuffer,
        contentType
      );

      const analysisResult = {
        rawText: azureResult.pages
          .map((page) => page.lines.map((line) => line.content).join("\n"))
          .join("\n"),
        tables: azureResult.tables || [],
        fields: azureResult.documents?.[0]?.fields || {},
      };

      return res.json({
        success: true,
        analysis: analysisResult,
        score: null,
        source: "azure_document_intelligence",
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

