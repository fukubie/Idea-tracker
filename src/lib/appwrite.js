import { Client, Databases, Account, Storage, Functions } from "appwrite";

const endpoint =
  import.meta.env.VITE_APPWRITE_ENDPOINT ??
  process.env.REACT_APP_APPWRITE_ENDPOINT ??
  "https://placeholder.appwrite.io/v1";
const projectId =
  import.meta.env.VITE_APPWRITE_PROJECT_ID ??
  process.env.REACT_APP_APPWRITE_PROJECT_ID ??
  "placeholder";

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const isAppwriteConfigured = Boolean(
  import.meta.env.VITE_APPWRITE_ENDPOINT || process.env.REACT_APP_APPWRITE_ENDPOINT
);
