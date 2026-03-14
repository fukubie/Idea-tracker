const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
// Use the current, supported Gemini model + API version
const GEMINI_MODEL = "gemini-1.5-flash-latest";

async function ensureAuthenticated() {
  const { account } = await import("../appwrite");
  try {
    await account.get();
  } catch (authError) {
    console.error("User not authenticated:", authError);
    throw new Error("Please log in to use AI features");
  }
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API is not configured. Add VITE_GOOGLE_API_KEY to your .env."
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    console.error("Gemini HTTP error:", res.status, await res.text());
    throw new Error("Gemini request failed");
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "";

  if (!text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return text.trim();
}

export async function expandIdea(title, description, category, priority) {
  try {
    await ensureAuthenticated();

    const safeDescription = description || "No detailed description provided.";

    const prompt = `You are helping a small team refine a project idea.

Title: ${title}
Description: ${safeDescription}
Category: ${category}
Priority: ${priority}

Using clear markdown, expand this into:
- A strengthened concept
- Key features / capabilities
- Risks and constraints
- Suggested tech stack (brief)
- Next 5–10 concrete steps

Keep it concise but useful for planning. Write in English.`;

    const expansionText = await callGemini(prompt);

    return {
      success: true,
      expansion: expansionText,
    };
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

    const safeDescription = description || "No detailed description provided.";

    const prompt = `You are preparing a short pitch summary for a project.

Title: ${title}
Idea: ${safeDescription}
Target audience: ${targetAudience}
Goal: ${goal}

Write a concise, structured markdown pitch with sections:
- Problem
- Solution
- Target users
- Value proposition
- Key features
- Implementation approach
- Impact and future potential

Keep it under 500 words and easy to skim.`;

    const pitchText = await callGemini(prompt);

    return {
      success: true,
      pitch: pitchText,
    };
  } catch (error) {
    console.error("Pitch generation error:", error);
    return {
      success: false,
      error: error.message || "Pitch generation failed",
    };
  }
}
