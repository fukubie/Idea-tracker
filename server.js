const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

const buildPath = path.join(__dirname, "build");

app.use(express.json());
app.use(express.static(buildPath));

// --- AI routes (server-side Gemini proxy) ---
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || response.statusText);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned no text");
  }

  return text;
}

app.post("/api/ai/expand", async (req, res) => {
  try {
    const { title, description, category, priority } = req.body || {};

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Missing title or description" });
    }

    const prompt = `Expand this idea into a short plan (2–4 paragraphs). Keep it practical and actionable.
Title: ${title}
Description: ${description}
Category: ${category || "General"}
Priority: ${priority || "Medium"}

Respond in markdown.`;

    const expansion = await callGemini(prompt);
    return res.json({ success: true, expansion });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("AI expand error:", e);
    return res
      .status(500)
      .json({ success: false, error: e.message || "Expansion failed" });
  }
});

app.post("/api/ai/pitch", async (req, res) => {
  try {
    const { title, description, targetAudience, goal } = req.body || {};

    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Missing title or description" });
    }

    const prompt = `You are an expert startup storyteller and pitch coach.
Create a concise, compelling pitch for the following idea that could be used in a pitch deck or investor email.

Return 3 sections:
- A short hook (1–2 sentences)
- A clear problem & solution summary
- A simple call-to-action for the target audience.

Title: ${title}
Description: ${description}
Target audience: ${targetAudience || "general tech audience"}
Goal: ${goal || "get interest and feedback"}

Respond in clear markdown with headings and bullet points where useful.`;

    const pitch = await callGemini(prompt);
    return res.json({ success: true, pitch });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("AI pitch error:", e);
    return res
      .status(500)
      .json({ success: false, error: e.message || "Pitch generation failed" });
  }
});

// Single-page app fallback: always serve index.html for unmatched routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(port, () => {
  // Simple startup log for Render logs
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

