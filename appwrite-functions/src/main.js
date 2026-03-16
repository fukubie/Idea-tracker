/**
 * Appwrite Function: AI idea expansion (Gemini).
 * For Git: Root directory = appwrite-functions, Entrypoint = src/main.js
 */
export default async ({ req = {}, res } = {}) => {
  try {
    let body = {};
    try {
      if (req.bodyJson != null && typeof req.bodyJson === "object") {
        body = req.bodyJson;
      } else if (req.bodyText != null && req.bodyText !== "") {
        body = JSON.parse(req.bodyText);
      } else if (req.body != null) {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      }
    } catch (parseErr) {
      return res?.json?.(
        { success: false, error: "Invalid request body: " + parseErr.message },
        400
      );
    }

    const { title, description, category, priority } = body;

    if (!title || !description) {
      return res?.json?.(
        { success: false, error: "Missing title or description" },
        400
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res?.json?.(
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
      return res?.json?.(
        { success: false, error: err || response.statusText },
        500
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return res?.json?.(
        { success: false, error: "Gemini returned no text" },
        500
      );
    }

    return res?.json?.({ success: true, expansion: text });
  } catch (e) {
    return res?.json?.({ success: false, error: e.message }, 500);
  }
};
