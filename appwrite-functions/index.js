/**
 * Appwrite Function: AI idea expansion using Gemini.
 *
 * This is a copy of appwrite-functions/idea-expand-gemini.js,
 * provided as index.js so you can zip this folder and deploy it
 * via Appwrite's Manual (tar.gz) deployment.
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

