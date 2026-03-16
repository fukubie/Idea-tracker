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
3. **Email verification:** Turn **on** for production so users must verify their email before using the app. Only turn this **off** temporarily for local testing.
4. Under **Auth** → **Settings**, add your app URL(s) to **Authorized origins** (e.g. `http://localhost:3000`, `http://localhost:5173`, and your production URL when you deploy).

### If verification emails don’t arrive (testing only)

- **In Appwrite (testing only):** **Auth** → **Settings** → you can temporarily turn **Email verification** **off**.
- **In the app (testing only):** In `.env` you can temporarily set `VITE_SKIP_EMAIL_VERIFICATION=true`. **Do not use this in production.**

For the most secure setup, keep email verification **on** and `VITE_SKIP_EMAIL_VERIFICATION=false`.

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
| comments       | string  | 10000        | no       |
| imageId        | string  | 255          | no       |

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

### Private messages table (optional but recommended)

To support secure, private 1‑to‑1 messaging:

1. In the **same database**, click **Create table**.
2. Set the table **ID** to e.g. `private-messages` (or any ID you like).
3. Add these attributes:

| Attribute ID   | Type   | Required |
|----------------|--------|----------|
| fromUserId     | string | yes      |
| toUserId       | string | yes      |
| body           | string | yes      |

4. In **Permissions**, allow authenticated **Users** to create documents.
5. The app will set per‑document permissions so that **only the sender and recipient can read/update/delete each message**.
6. If you use a custom ID for this table, put it into `.env` as `VITE_APPWRITE_MESSAGES_COLLECTION_ID`.

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

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| White screen / “Invalid URL” | `.env` has correct `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`. Restart dev server after editing `.env`. |
| “Unauthorized” or 401 | In Appwrite **Auth** → **Settings**, add your app URL (e.g. `http://localhost:5173`) to **Authorized origins**. |
| “Collection not found” / 404 | Database and table IDs in `.env` match the IDs in the Appwrite console. The preferences table must have ID `user-preferences`. |
| “Missing attribute” when saving idea | In the ideas table, add all attributes listed in the table above (same IDs and types). |
| Profile picture upload fails | Storage bucket exists, its ID is in `VITE_APPWRITE_STORAGE_BUCKET_ID`, and bucket permissions allow the current user to create/update. |

Once these are set, sign-in and the backend (auth + ideas + preferences + storage) are connected to Appwrite.
