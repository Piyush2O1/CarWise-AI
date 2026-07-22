const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const { retryAsync } = require("../utils/retryHelper");

// Load environment variables from ai-service/.env so the model name is available
// even when this module is required directly outside the main server entrypoint.
dotenv.config();

// Use only the configured model from the environment.
// No hardcoded Gemini model names are allowed.
const configuredModel = process.env.GEMINI_MODEL?.trim();

if (!configuredModel) {
  const missingModelError = new Error(
    "GEMINI_MODEL is missing. Set GEMINI_MODEL in ai-service/.env to a valid Gemini model name."
  );
  missingModelError.status = 500;
  throw missingModelError;
}

console.log(`[Gemini] Selected model: ${configuredModel}`);

const createModel = (modelName) => {
  if (!modelName) {
    const error = new Error(
      "GEMINI_MODEL is missing. Set GEMINI_MODEL in ai-service/.env to a valid Gemini model name."
    );
    error.status = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

const extractErrorDetails = (error) => {
  if (!error) {
    return { status: 500, code: "UNKNOWN_ERROR", message: "Unknown error" };
  }

  const responseStatus = error.status || error.response?.status || 500;
  const responseBody = error.response?.data;
  const responseMessage =
    responseBody?.error?.message ||
    responseBody?.message ||
    responseBody ||
    error.message ||
    String(error);

  return {
    status: responseStatus,
    code: error.code || "UNKNOWN_ERROR",
    message: responseMessage,
  };
};

const formatClientError = (error) => {
  const { status, message } = extractErrorDetails(error);
  const normalizedMessage = String(message || "").toLowerCase();

  // Handle Gemini 503 / temporary overload responses.
  if (status === 503 || /temporarily unavailable|service unavailable|overloaded|busy/i.test(normalizedMessage)) {
    return {
      status: 503,
      message: "The AI model is currently busy. Please try again in a few seconds.",
    };
  }

  // Handle Gemini 429 / quota or rate-limit responses.
  if (status === 429 || /too many requests|rate limit|quota/i.test(normalizedMessage)) {
    return {
      status: 429,
      message: "API usage limit reached. Please try again later.",
    };
  }

  // Handle invalid or unavailable model responses.
  if (
    status === 404 ||
    /model not found|unsupported model|not found|not available|invalid model/i.test(normalizedMessage)
  ) {
    return {
      status: 404,
      message: "The selected Gemini model is invalid or unavailable. Please verify GEMINI_MODEL in ai-service/.env.",
    };
  }

  // Handle transient network failures.
  if (/network/i.test(normalizedMessage) || /ECONNREFUSED|ECONNABORTED|ENOTFOUND|fetch failed/i.test(normalizedMessage)) {
    return {
      status: 503,
      message: "Unable to connect to the AI service.",
    };
  }

  return {
    status: 500,
    message: "Something went wrong while analyzing the contract.",
  };
};

const generateContractAnalysis = async (contractText) => {
  const prompt = `
${require("../prompts/contractAnalysisPrompt")}

CONTRACT TEXT:
${contractText}
`;

  const runModel = async (model) => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  const runWithRetries = async (model) => {
    return retryAsync(() => runModel(model), {
      attempts: 3,
      delayMs: 3000,
    });
  };

  try {
    // Use only the configured model from the environment.
    const model = createModel(configuredModel);
    return await runWithRetries(model);
  } catch (error) {
    const clientError = formatClientError(error);
    const wrappedError = new Error(clientError.message);
    wrappedError.status = clientError.status;
    throw wrappedError;
  }
};

module.exports = {
  generateContractAnalysis,
  formatClientError,
};
