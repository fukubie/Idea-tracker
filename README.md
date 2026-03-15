## 🪴 Idea Tracker

**A focused idea management app with AI assistance, built with React, Vite, Tailwind CSS, Appwrite, and Lingo.dev.**

Capture ideas, organize them by category and priority, expand them with AI, and manage everything behind secure authentication with a clean, animated UI and multilingual support.

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend services**: Appwrite (auth, database, storage)
- **AI**: Gemini via server-side proxy / Appwrite Functions
- **Internationalization**: Lingo.dev

## 📦 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

1. Copy `.env.example` to `.env`.
2. Fill in your Appwrite project/database/bucket IDs and any AI keys.
3. For full backend setup (auth, database, storage, AI), see `APPWRITE_SETUP.md`.

### 3. Run in development

```bash
npm run dev
```

The app runs at `http://localhost:3000` (see `vite.config.js` for the dev server port).

### 4. Build & run in production

```bash
npm run build    # builds to /build
npm start        # serves the built app via Express (server.js)
```

`server.js` serves the SPA from the `build` folder and exposes AI routes under `/api/ai/*`.

## 🔐 Secret management

- Keep AI keys such as `GEMINI_API_KEY` on the **server** or in **Appwrite Function secrets**.
- Do **not** put private AI keys directly into browser-exposed `VITE_*` environment variables.

## 📄 License

This project is available under the MIT License.
