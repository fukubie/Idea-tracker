/**
 * Appwrite Function: AI pitch generation using Gemini.
 *
 * Setup:
 * 1. In Appwrite: Functions → Create function → Node.js runtime.
 * 2. Add secret: GEMINI_API_KEY = your key from https://aistudio.google.com/app/apikey
 * 3. Paste this file as the function source and deploy.
 * 4. Copy the function ID into .env as VITE_APPWRITE_PITCH_FUNCTION_ID.
 *
 * The app sends body: { title, description, targetAudience, goal }
 * and expects responseBody JSON: { success: true, pitch: "..." } or { success: false, error: "..." }
 */
export default async ({ req, res }) => {
  try {
    const body = JSON.parse(req.body ?? "{}");
    const { title, description, targetAudience, goal } = body;

    if (!title || !description) {
      return res.json(
        { success: false, error: "Missing title or description" },
        400
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json(
        { success: false, error: "GEMINI_API_KEY not set" },
        500
      );
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
      return res.json(
        { success: false, error: err || response.statusText },
        500
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return res.json(
        { success: false, error: "Gemini returned no text" },
        500
      );
    }

    return res.json({ success: true, pitch: text });
  } catch (e) {
    return res.json({ success: false, error: e.message }, 500);
  }
};

