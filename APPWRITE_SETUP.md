# Appwrite setup – enable sign-in and backend

Follow these steps to connect Idea Tracker to Appwrite so **authentication** (email/password sign-in) and **ideas storage** work.

---

## 1. Create an Appwrite account and project

1. Go to **[https://cloud.appwrite.io](https://cloud.appwrite.io)** and sign up or log in.
2. Click **Create project** and name it (e.g. `Idea Tracker`).
3. Open your project and go to **Settings** (gear icon).
4. Copy:
   - **Project ID** → use as `VITE_APPWRITE_PROJECT_ID` in `.env`.
   - **API Endpoint** (e.g. `https://cloud.appwrite.io/v1`) → use as `VITE_APPWRITE_ENDPOINT` in `.env`.

---

## 2. Enable email/password auth

1. In the left sidebar, open **Auth** → **Settings**.
2. Under **Email/Password**, turn **Enable** on.
3. **Email verification:** Turn **off** if you don’t want verification (e.g. verification emails don’t arrive or you’re testing). The app will still work. If you turn it **on**, users must verify before the app treats them as verified unless you skip it in the app (see below).
4. Under **Auth** → **Settings**, add your app URL(s) to **Authorized origins** (e.g. `http://localhost:3000`, `http://localhost:5173`, and your production URL when you deploy).

### If verification emails don’t arrive or you want to skip verification

- **In Appwrite:** **Auth** → **Settings** → turn **Email verification** **off**. New users can sign in without verifying.
- **In the app:** In `.env` set `VITE_SKIP_EMAIL_VERIFICATION=true`. The app will no longer show the “Verify your email” screen and will treat logged-in users as verified. Restart the dev server after changing `.env`.

---

## 3. Create the database and tables

In the Appwrite console, **tables** are what the app uses as “collections” — the **table ID** is the value you put in `VITE_APPWRITE_COLLECTION_ID`.

### Where to find database and table IDs

- **Database ID:** Open your database, then go to **Settings** (gear or “…” menu) or the database overview. The **ID** is shown there (long string like `65abc123...`). Copy it for `VITE_APPWRITE_DATABASE_ID`.
- **Table ID:** Click the table name to open it, then open **Settings** or the table’s **Overview** / details. The **ID** is listed there. Copy it for `VITE_APPWRITE_COLLECTION_ID`.
- If you only see a **name** and no ID: when **creating** the table, check for a “Custom ID” or “Table ID” field and set it (e.g. `ideas` or `user-preferences`). If the UI doesn’t show an ID after creation, try the table **Settings** or the **three-dots menu** on the table row.

1. In the sidebar, go to **Databases** → **Create database**.
2. Name it (e.g. `ideas-db`), then create it.
3. Copy the database **ID** (e.g. `65abc123...`) → use as `VITE_APPWRITE_DATABASE_ID` in `.env`.

### Ideas table

1. Inside the database, click **Create table** (this is the same as a “collection” in the app).
2. Name it (e.g. `ideas`) and create the table.
3. Copy the table **ID** → use as `VITE_APPWRITE_COLLECTION_ID` in `.env`.
4. In the table, go to **Attributes** and add these (create any that are missing):

| Attribute ID   | Type    | Size/Format  | Required |
|----------------|---------|--------------|----------|
| title          | string  | 500          | yes      |
| description    | string  | 5000         | yes      |
| category       | string  | 100          | yes      |
| priority       | string  | 50           | no       |
| status         | string  | 50           | no       |
| userId         | string  | 255          | yes      |
| userName       | string  | 500          | no       |
| userProfilePicture | string | 1000     | no       |
| isPublic       | boolean | -            | no       |
| tags           | string  | 1000         | no       |
| previewUrl     | string  | 500          | no       |
| githubUrl      | string  | 500          | no       |
| likes          | integer | -            | no       |
| likedBy        | string  | 5000         | no       |
| expandedAt     | string  | 50           | no       |

5. In the table, open **Settings** → **Permissions**:
   - Add: **Users** can **read**, **create**, **update**, **delete** (the app sets per-document permissions in code).

### User preferences table

1. In the **same database**, click **Create table** again.
2. Set the table **ID** to exactly: `user-preferences` (the app uses this ID).
3. Add these attributes:

| Attribute ID        | Type   | Required |
|---------------------|--------|----------|
| userId              | string | yes      |
| customCategories    | string | no       |
| emailNotifications  | boolean| no       |
| ideaAdded           | boolean| no       |
| ideaExpanded        | boolean| no       |
| weeklySummary      | boolean| no       |

For **customCategories** use type **string** (the app stores a JSON array as a string).  
4. Set **Permissions** the same way as for the ideas table (users can read, create, update, delete).

---

## 4. Create storage bucket (profile pictures)

1. In the sidebar, go to **Storage** → **Create bucket**.
2. Name it (e.g. `avatars`), set it to **File** and create it.
3. Copy the bucket **ID** → use as `VITE_APPWRITE_STORAGE_BUCKET_ID` in `.env`.
4. Open the bucket → **Settings** → **Permissions**:
   - Add: **Users** can **read**, **create**, **update**, **delete** (or restrict as you prefer; the app uploads per user).

---

## 5. Configure your `.env` file

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set (replace with your real IDs):

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_COLLECTION_ID=your_ideas_collection_id_here
VITE_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id_here
```

- Leave `VITE_APPWRITE_FUNCTION_ID` empty if you are not using the AI expansion feature yet.

3. Restart the dev server after changing `.env`:
   ```bash
   npm run dev
   ```

---

## 6. Test sign-in and ideas

1. Open the app (e.g. `http://localhost:3000` or `http://localhost:5173`).
2. Go to **Login** and click **Register**.
3. Enter email and password (min 8 characters) and register.
4. If email verification is enabled, check your inbox and verify.
5. After sign-in you should see the home screen; add an idea and confirm it appears and persists after refresh.

---

## 7. Optional: AI expansion function (“Expand with AI”)

The “Expand with AI” feature calls an **Appwrite Function**. The app sends `{ title, description, category, priority }` and expects JSON back: `{ success: true, expansion: "..." }` or `{ success: false, error: "..." }`.

### 7.1 Create the function in Appwrite

1. In the sidebar: **Functions** → **Create function**.
2. Name it (e.g. `idea-expand`), choose **Node.js** runtime, create it.
3. Copy the function **ID** → put it in `.env` as `VITE_APPWRITE_FUNCTION_ID`.
4. Use the code from **`appwrite-functions/idea-expand-gemini.js`** in this repo (paste into the function editor in Appwrite), or copy from the example below.

### 7.2 Add your AI API key as a secret

1. Open the function → **Settings** or **Variables**.
2. Add a **secret**:
   - For **Gemini**: name `GEMINI_API_KEY`, value = your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - For OpenAI: `OPENAI_API_KEY`; for Groq: `GROQ_API_KEY`.
3. You’ll use this name inside the function code (e.g. `process.env.GEMINI_API_KEY`).

### 7.3 Function code (Node.js)

The function receives the request body as JSON and must return a string that is valid JSON in this shape:

- Success: `{ "success": true, "expansion": "markdown text here" }`
- Failure: `{ "success": false, "error": "message" }`

**Example using Gemini** (recommended if you have a Gemini API key):

```javascript
export default async ({ req, res }) => {
  try {
    const body = JSON.parse(req.body ?? "{}");
    const { title, description, category, priority } = body;

    if (!title || !description) {
      return res.json({ success: false, error: "Missing title or description" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: false, error: "GEMINI_API_KEY not set" }, 500);
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
      return res.json({ success: false, error: err || response.statusText }, 500);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    if (!text) {
      return res.json({ success: false, error: "Gemini returned no text" }, 500);
    }

    return res.json({ success: true, expansion: text });
  } catch (e) {
    return res.json({ success: false, error: e.message }, 500);
  }
};
```

**Appwrite:** The payload from `createExecution` is in `req.body` (as a string). Use `return res.json({ success: true, expansion })` so the execution’s `responseBody` is the JSON the app expects.

### 7.4 Deploy and test

1. Deploy the function (e.g. paste the code in the console editor and deploy, or connect a repo).
2. In the app, open an idea and use “Expand with AI”. If it fails, check the function logs in Appwrite and that `VITE_APPWRITE_FUNCTION_ID` in `.env` matches the function ID.

### 7.5 Using OpenAI or Groq instead of Gemini

- **OpenAI:** Secret `OPENAI_API_KEY`. POST to `https://api.openai.com/v1/chat/completions` with `model: "gpt-4o-mini"`, `messages: [{ role: "user", content: prompt }]`. Get text from `data.choices[0].message.content`.
- **Groq:** Secret `GROQ_API_KEY`. Use Groq’s chat API; same idea: send the prompt, parse the reply into `expansion`.
- Always return `{ success: true, expansion }` or `{ success: false, error }`.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| White screen / “Invalid URL” | `.env` has correct `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`. Restart dev server after editing `.env`. |
| “Unauthorized” or 401 | In Appwrite **Auth** → **Settings**, add your app URL (e.g. `http://localhost:5173`) to **Authorized origins**. |
| “Collection not found” / 404 | Database and table IDs in `.env` match the IDs in the Appwrite console. The preferences table must have ID `user-preferences`. |
| “Missing attribute” when saving idea | In the ideas table, add all attributes listed in the table above (same IDs and types). |
| Profile picture upload fails | Storage bucket exists, its ID is in `VITE_APPWRITE_STORAGE_BUCKET_ID`, and bucket permissions allow the current user to create/update. |

Once these are set, sign-in and the backend (auth + ideas + preferences + storage) are connected to Appwrite.
