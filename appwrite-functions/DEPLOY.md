# Deploying Appwrite Functions (idea-expand / idea-pitch)

The Console only accepts **tar.gz** for manual upload. If that doesn’t work for you, use **Git** or **CLI** below.

---

## Option 1: Manual upload (tar.gz)

1. **Create a tar.gz with ONLY the function (not the whole app)**
   - If the build installs 1900+ packages, you uploaded the wrong archive (e.g. the whole project). The function has **no** dependencies, so the build should be very fast.
   - From the **repo root** (Idea-tracker folder), run:
     ```bash
     cd appwrite-functions
     tar --exclude='*.tar.gz' -czf idea-expand.tar.gz package.json src
     ```
   - Use **only** `package.json` and `src` (no other files). You get `appwrite-functions/idea-expand.tar.gz`. Inside the archive: `package.json` and `src/main.js` at the top level.

2. **In Appwrite Console**
   - Functions → **idea-expand** → **Deployments** → **Create deployment**.
   - Choose **Manual** (or “Upload”).
   - Upload **idea-expand.tar.gz**.
   - **Entrypoint**: `src/main.js`.
   - Activate the deployment after build.

3. **For idea-pitch**
   - Create `appwrite-functions/src/main.js` with the contents of `idea-pitch-gemini.js` (or a separate folder), then run the same `tar` from that folder and upload the resulting `.tar.gz`.

---

## Option 2: Git

1. **Connect the repo**
   - Functions → **idea-expand** → **Settings** → **Git repository** (or **Configuration** → **Git settings**) → **Connect Git repository**.
   - Authorize and select your repo (the one containing this Idea-tracker project).
   - Set **Production branch** (e.g. `main`).

2. **Root directory and entrypoint (must match the repo)**
   - **Root directory**: `appwrite-functions`  
     (The repo has `appwrite-functions/src/main.js` and `appwrite-functions/package.json`. Appwrite copies everything inside this folder; the path is relative to the repo root.)
   - **Entrypoint**: `src/main.js`  
     (relative to the root directory, so the full path is `appwrite-functions/src/main.js`.)
   - Save the Git configuration.

3. **Deploy**
   - Commit and push the `appwrite-functions/` folder (including `src/main.js`) to the production branch. Appwrite will build and deploy on push.

### If you get "No source code found"

- **Ensure `appwrite-functions/src/main.js` is committed and pushed** (see file in repo). Then try:
  - **Setup A:** Root directory = `appwrite-functions`, Entrypoint = `src/main.js`.
  - **Setup B (if A fails):** Root directory = *empty*, Entrypoint = `appwrite-functions/src/main.js`.
- Ensure that folder is committed and pushed: e.g. `appwrite-functions/src/main.js` and `appwrite-functions/package.json` must exist on the production branch.
- Avoid spaces or special characters in the root directory path.
- After changing Git settings, trigger a new deployment (e.g. push an empty commit or use “Redeploy” if available).

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
| Git      | Connect repo, **Root directory** = `appwrite-functions`, **Entrypoint** = `src/main.js`, push to production branch |
| CLI      | `appwrite init` + `appwrite pull functions`, set **path** to `appwrite-functions`, **entrypoint** `src/main.js`, then `appwrite push functions` |

If **tar.gz upload fails** (browser, size, or format), use **Git** or **CLI**; both deploy the same code without using the manual upload.
