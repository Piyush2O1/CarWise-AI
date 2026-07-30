const path = require("path");
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

if (!endpoint || !apiKey) {
  throw new Error(
    "Azure Document Intelligence configuration is missing. Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY in ai-service/.env"
  );
}

const client = new DocumentAnalysisClient(
  endpoint,
  new AzureKeyCredential(apiKey)
);

async function analyzeDocumentFromUrlOrBuffer(source, contentType = "application/pdf") {
  const request = typeof source === "string" && /^https?:\/\//i.test(source)
    ? { urlSource: source }
    : { bodySource: source, contentType };

  const poller = await client.beginAnalyzeDocument("prebuilt-contract", request);
  return await poller.pollUntilDone();
}

module.exports = {
  analyzeDocumentFromUrlOrBuffer,
};
