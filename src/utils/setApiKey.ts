// Utility to set OpenAI API key
export function setApiKey(apiKey?: string) {
  if (typeof window !== "undefined" && apiKey) {
    localStorage.setItem("OPENAI_API_KEY", apiKey);
    console.log("OpenAI API key has been set in localStorage");
    return true;
  }
  return false;
}

// Auto-execute when this module is imported
if (typeof window !== "undefined") {
  setApiKey();
}