/**
 * Appwrite Function: AI idea expansion using Gemini.
 *
 * Setup:
 * 1. In Appwrite: Functions → Create function → Node.js runtime.
 * 2. Add secret: GEMINI_API_KEY = your key from https://aistudio.google.com/app/apikey
 * 3. Paste this file as the function source and deploy.
 * 4. Copy the function ID into .env as VITE_APPWRITE_FUNCTION_ID.
 *
 * The app sends body: { title, description, category?, priority? }
 * and expects responseBody JSON: { success: true, expansion: "..." } or { success: false, error: "..." }
 */
export default async ({ req, res }) => {
  try {
    const body = JSON.parse(req.body ?? "{}");
    const { title, description, category, priority } = body;

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

    const prompt = `Expand this idea into a short plan (2–4 paragraphs). Keep it practical and actionable.
Title: ${title}
Description: ${description}
Category: ${category || "General"}
Priority: ${priority || "Medium"}

Respond in markdown.`;

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

    return res.json({ success: true, expansion: text });
  } catch (e) {
    return res.json({ success: false, error: e.message }, 500);
  }
};
