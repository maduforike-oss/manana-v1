// Utility to set OpenAI API key
export function setApiKey() {
  if (typeof window !== "undefined") {
    localStorage.setItem("OPENAI_API_KEY", "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");
    console.log("OpenAI API key has been set in localStorage");
    return true;
  }
  return false;
}

// Auto-execute when this module is imported
if (typeof window !== "undefined") {
  setApiKey();
}