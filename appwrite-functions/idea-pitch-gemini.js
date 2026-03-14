/**
 * Appwrite Function: AI pitch using Gemini.
 * In Appwrite: Functions → Create function → Node.js → paste this code.
 * Add secret: GEMINI_API_KEY. Deploy, then copy the function ID into your
 * Site env as VITE_APPWRITE_PITCH_FUNCTION_ID.
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

    const prompt = `You are an expert startup storyteller. Create a short pitch for this idea (hook, problem/solution, call-to-action). Use markdown.
Title: ${title}
Description: ${description}
Target: ${targetAudience || "general"}
Goal: ${goal || "get interest"}`;

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
