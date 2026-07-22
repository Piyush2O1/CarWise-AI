const fs = require("fs");

// Use pdfjs-dist directly to extract text from PDFs in Node.
// This avoids import-shape issues with higher-level wrappers.
const extractTextFromPDF = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const pdfBytes = new Uint8Array(pdfBuffer);

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }

  // Ensure we return a string even if empty
  return fullText || "";
};

module.exports = extractTextFromPDF;