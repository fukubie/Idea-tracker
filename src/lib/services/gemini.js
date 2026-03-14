import { functions } from "../appwrite";

const AI_EXPANSION_FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_ID;
const AI_PITCH_FUNCTION_ID = import.meta.env.VITE_APPWRITE_PITCH_FUNCTION_ID;

async function ensureAuthenticated() {
  const { account } = await import("../appwrite");
  try {
    await account.get();
  } catch (authError) {
    console.error("User not authenticated:", authError);
    throw new Error("Please log in to use AI features");
  }
}

async function executeFunction(functionId, payload) {
  const response = await functions.createExecution(
    functionId,
    JSON.stringify(payload)
  );

  if (response.status !== "completed") {
    console.error("Function execution failed:", response);
    throw new Error(
      `Function execution failed with status: ${response.status}`
    );
  }

  if (response.errors && response.errors.trim()) {
    console.error("Function errors:", response.errors);
    throw new Error(`Function error: ${response.errors}`);
  }

  if (!response.responseBody || response.responseBody.trim() === "") {
    throw new Error("Function returned empty response");
  }

  if (response.responseBody.includes("Build like a team of hundreds")) {
    throw new Error("Function returned default response - check deployment");
  }

  try {
    return JSON.parse(response.responseBody);
  } catch (parseError) {
    console.error("Failed to parse response:", response.responseBody);
    throw new Error("Invalid response format from function");
  }
}

export async function expandIdea(title, description, category, priority) {
  try {
    await ensureAuthenticated();

    const result = await executeFunction(AI_EXPANSION_FUNCTION_ID, {
      title,
      description,
      category,
      priority,
    });

    if (result.success) {
      return {
        success: true,
        expansion: result.expansion,
      };
    } else {
      throw new Error(result.error || "Function execution failed");
    }
  } catch (error) {
    console.error("Expansion error:", error);
    return {
      success: false,
      error: error.message || "Expansion failed",
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

    if (!AI_PITCH_FUNCTION_ID) {
      throw new Error("AI pitch function is not configured");
    }

    const result = await executeFunction(AI_PITCH_FUNCTION_ID, {
      title,
      description,
      targetAudience,
      goal,
    });

    if (result.success) {
      return {
        success: true,
        pitch: result.pitch,
      };
    } else {
      throw new Error(result.error || "Pitch generation failed");
    }
  } catch (error) {
    console.error("Pitch generation error:", error);
    return {
      success: false,
      error: error.message || "Pitch generation failed",
    };
  }
}
