import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { databases } from "../appwrite";
import { useUser } from "./user";
import { ID, Permission, Role, Query } from "appwrite";
import { toast } from "sonner";

const MessagesContext = createContext();

export function useMessages() {
  return useContext(MessagesContext);
}

const MESSAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID;

export function MessagesProvider({ children }) {
  const { current: user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyMessages = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    if (!MESSAGES_COLLECTION_ID) {
      // Private messaging not configured.
      setConversations([]);
      return;
    }
    try {
      setIsLoading(true);

      // Appwrite doesn't support OR queries directly, so we fetch sent and received separately.
      const [sent, received] = await Promise.all([
        databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          [Query.equal("fromUserId", user.$id), Query.orderDesc("$createdAt")]
        ),
        databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          [Query.equal("toUserId", user.$id), Query.orderDesc("$createdAt")]
        ),
      ]);

      const all = [...sent.documents, ...received.documents].sort(
        (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
      );

      setConversations(all);
    } catch (error) {
      // If messages collection is missing, fail silently (no spammy toasts)
      if (error?.code === 404) {
        console.warn(
          "Messages collection not found; private messaging is disabled.",
          { collectionId: MESSAGES_COLLECTION_ID || "(not set)" }
        );
      } else {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load private messages.");
      }
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyMessages();
  }, [fetchMyMessages]);

  const sendMessage = async (toUserId, body) => {
    if (!user) {
      toast.error("Please log in to send messages");
      return;
    }
    if (!MESSAGES_COLLECTION_ID) {
      toast.error("Private messaging is not configured.");
      return;
    }
    const text = (body || "").trim();
    if (!text) return;

    try {
      const doc = await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          fromUserId: user.$id,
          toUserId,
          body: text,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.read(Role.user(toUserId)),
          Permission.update(Role.user(user.$id)),
          Permission.update(Role.user(toUserId)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      setConversations((prev) => [doc, ...prev]);
      return doc;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      throw error;
    }
  };

  const contextValue = {
    conversations,
    isLoading,
    refresh: fetchMyMessages,
    sendMessage,
  };

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
}

