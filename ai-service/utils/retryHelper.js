const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableGeminiError = (error) => {
  if (!error) {
    return false;
  }

  const status = error.status || error.response?.status;
  const message = String(error.message || "").toLowerCase();
  const code = error.code || "";

  if (["ECONNABORTED", "ECONNREFUSED", "ENOTFOUND"].includes(code)) {
    return true;
  }

  if (/network/i.test(message)) {
    return true;
  }

  return status === 503;
};

const retryAsync = async (
  fn,
  {
    attempts = 3,
    delayMs = 3000,
    shouldRetry = isRetryableGeminiError,
  } = {}
) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !shouldRetry(error)) {
        break;
      }

      await delay(delayMs);
    }
  }

  throw lastError;
};

module.exports = {
  delay,
  retryAsync,
  isRetryableGeminiError,
};
