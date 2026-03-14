async function ensureAuthenticated() {
  const { account } = await import("../appwrite");
  try {
    await account.get();
  } catch (authError) {
    console.error("User not authenticated:", authError);
    throw new Error("Please log in to use AI features");
  }
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response.json();
}

export async function expandIdea(title, description, category, priority) {
  try {
    await ensureAuthenticated();

    const result = await postJson("/api/ai/expand", {
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
      throw new Error(result.error || "Expansion failed");
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

    const result = await postJson("/api/ai/pitch", {
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
