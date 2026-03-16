import { functions } from "../appwrite";

const EXPAND_FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_ID;
const PITCH_FUNCTION_ID = import.meta.env.VITE_APPWRITE_PITCH_FUNCTION_ID;

async function ensureAuthenticated() {
  const { account } = await import("../appwrite");
  try {
    await account.get();
  } catch (authError) {
    console.error("User not authenticated:", authError);
    throw new Error("Please log in to use AI features");
  }
}

async function callAppwriteFunction(functionId, payload) {
  if (!functionId) {
    throw new Error("AI function is not configured in Appwrite.");
  }

  const response = await functions.createExecution(
    functionId,
    JSON.stringify(payload),
    false // async: false = wait for completion, get responseBody in result
  );

  if (response.status !== "completed") {
    const detail =
      [response.errors, response.responseBody].filter(Boolean).join(" ") ||
      response.status;
    console.error("AI function execution failed:", response.status, response.errors, response.responseBody);
    throw new Error(
      `AI function execution failed: ${detail}`
    );
  }

  if (response.errors && response.errors.trim()) {
    console.error("AI function errors:", response.errors);
    throw new Error(`AI function error: ${response.errors}`);
  }

  if (!response.responseBody || response.responseBody.trim() === "") {
    throw new Error("AI function returned empty response");
  }

  let result;
  try {
    result = JSON.parse(response.responseBody);
  } catch (parseError) {
    console.error("Failed to parse AI function response:", response.responseBody);
    throw new Error("Invalid response format from AI function");
  }

  return result;
}

export async function expandIdea(title, description, category, priority) {
  try {
    await ensureAuthenticated();

    const payload = {
      title,
      description: description || "No detailed description provided.",
      category,
      priority,
    };

    const result = await callAppwriteFunction(EXPAND_FUNCTION_ID, payload);

    if (!result.success) {
      const msg = result.error || "Expansion failed";
      console.error("Expand function returned error:", msg, result);
      throw new Error(msg);
    }

    return {
      success: true,
      expansion: result.expansion,
    };
  } catch (error) {
    console.error("Expansion error:", error);
    let message = error.message || "Expansion failed";
    if (message.includes("could not be found")) {
      message += " Use the Function ID from Appwrite (function Settings/Overview), not the Deployment ID. Check VITE_APPWRITE_FUNCTION_ID in .env.";
    }
    return {
      success: false,
      error: message,
    };
  }
}

export async function generatePitch(
  title,
  description,
  targetAudience,
  goal
) {
  try {
    await ensureAuthenticated();

    const payload = {
      title,
      description: description || "No detailed description provided.",
      targetAudience,
      goal,
    };

    const result = await callAppwriteFunction(PITCH_FUNCTION_ID, payload);

    if (!result.success) {
      throw new Error(result.error || "Pitch generation failed");
    }

    return {
      success: true,
      pitch: result.pitch,
    };
  } catch (error) {
    console.error("Pitch generation error:", error);
    let message = error.message || "Pitch generation failed";
    if (message.includes("could not be found")) {
      message += " Use the Function ID from Appwrite (function Settings/Overview), not the Deployment ID. Check VITE_APPWRITE_PITCH_FUNCTION_ID in .env.";
    }
    return {
      success: false,
      error: message,
    };
  }
}
