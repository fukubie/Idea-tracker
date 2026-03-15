# Deploying Appwrite Functions (idea-expand / idea-pitch)

The Console only accepts **tar.gz** for manual upload. If that doesn’t work for you, use **Git** or **CLI** below.

---

## Option 1: Manual upload (tar.gz)

1. **Create a tar.gz from the function folder**
   - For **idea-expand**: open a terminal in the repo root, then:
     ```bash
     cd appwrite-functions/deploy-expand
     tar --exclude='*.tar.gz' -czf ../idea-expand.tar.gz .
     ```
   - You get `appwrite-functions/idea-expand.tar.gz`. The archive must contain `src/main.js` (so the **contents** of `deploy-expand` are at the root of the archive, not the folder itself).

2. **In Appwrite Console**
   - Functions → **idea-expand** → **Deployments** → **Create deployment**.
   - Choose **Manual** (or “Upload”).
   - Upload **idea-expand.tar.gz**.
   - **Entrypoint**: `src/main.js` (must match your function’s Settings).
   - Activate the deployment after build.

3. **For idea-pitch**
   - Use a folder that has `src/main.js` with the contents of `idea-pitch-gemini.js`, then run the same `tar` command from that folder and upload the resulting `.tar.gz`.

---

## Option 2: Git

1. **Connect the repo**
   - Functions → **idea-expand** → **Settings** → **Git repository** (or **Configuration** → **Git settings**) → **Connect Git repository**.
   - Authorize and select your repo (e.g. the one containing this Idea-tracker project).
   - Set **Production branch** (e.g. `main`).
   - **Root directory**: path to the folder that contains `src/main.js`:
     - For this repo: `appwrite-functions/deploy-expand`  
     (so Appwrite uses `appwrite-functions/deploy-expand/src/main.js` as the code).

2. **Entrypoint**
   - In the function’s runtime/configuration, **Entrypoint** should be `src/main.js` (relative to the root directory).

3. **Deploy**
   - Push a commit to the production branch. Appwrite will build and deploy automatically.

---

## Option 3: Appwrite CLI

1. **Install and log in**
   - Install: [Appwrite CLI](https://appwrite.io/docs/tooling/command-line/installation).
   - Log in: `appwrite login`.
   - In your **project root** (where you want config): `appwrite init` and select your project.

2. **Pull the function (so CLI knows about it)**
   - In the same folder: `appwrite pull functions`.
   - This creates/updates `appwrite.config.json` and pulls your existing function (e.g. idea-expand).

3. **Point the config at your code**
   - Open `appwrite.config.json`, find the function (e.g. by name or ID).
   - Set **path** to the folder that contains `src/main.js`, e.g. `appwrite-functions/deploy-expand`.
   - Ensure **entrypoint** is `src/main.js` (or whatever your function’s Settings say).

4. **Copy code if needed**
   - The pulled function may have its own path (e.g. `functions/<id>`). Either:
     - Copy `appwrite-functions/deploy-expand/src/main.js` (and the rest of `deploy-expand`) into that path, or  
     - Change **path** in `appwrite.config.json` to `appwrite-functions/deploy-expand` and keep **entrypoint** as `src/main.js`.

5. **Deploy**
   - From the folder that contains `appwrite.config.json`:
     ```bash
     appwrite push functions
     ```
   - The CLI packages and deploys; the new deployment should appear in the Console.

---

## Summary

| Method   | Format / requirement |
|----------|-----------------------|
| Manual   | **tar.gz** (contents of folder at archive root; entrypoint e.g. `src/main.js`) |
| Git      | Connect repo, set **Root directory** to `appwrite-functions/deploy-expand`, push to production branch |
| CLI      | `appwrite init` + `appwrite pull functions`, set **path** to `appwrite-functions/deploy-expand`, then `appwrite push functions` |

If **tar.gz upload fails** (browser, size, or format), use **Git** or **CLI**; both deploy the same code without using the manual upload.
