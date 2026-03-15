import { useState, useMemo } from "react";
import { useUser } from "../lib/context/user";
import { useMessages } from "../lib/context/messages";
import { motion } from "framer-motion";
import moment from "moment";
import { MessageCircle, Send, User as UserIcon } from "lucide-react";

export function Messages({ navigate }) {
  const user = useUser();
  const messages = useMessages();
  const [activeUserId, setActiveUserId] = useState(null);
  const [draft, setDraft] = useState("");

  if (!user.current) {
    navigate("login");
    return null;
  }

  const myId = user.current.$id;

  const threads = useMemo(() => {
    const grouped = new Map();
    messages.conversations.forEach((msg) => {
      const otherId = msg.fromUserId === myId ? msg.toUserId : msg.fromUserId;
      if (!grouped.has(otherId)) {
        grouped.set(otherId, []);
      }
      grouped.get(otherId).push(msg);
    });
    return Array.from(grouped.entries()).map(([otherId, msgs]) => ({
      otherId,
      last: msgs[0],
      messages: msgs,
    }));
  }, [messages.conversations, myId]);

  const currentThread =
    activeUserId &&
    threads.find((t) => t.otherId === activeUserId)?.messages.slice().reverse();

  const getDisplayName = (id) => {
    if (id === myId) return "You";
    // For now we just show a generic label; you can extend this by
    // resolving user IDs via a dedicated users collection.
    return "User";
  };

  const getInitials = (label) => {
    if (!label) return "U";
    return label
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeUserId) return;
    try {
      await messages.sendMessage(activeUserId, text);
      setDraft("");
    } catch {
      // error toast handled in messages context
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#FD366E]" />
          Private Messages
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Thread list */}
        <div className="sm:col-span-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Conversations
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {threads.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
                No messages yet.
              </div>
            ) : (
              threads.map((thread) => {
                const isActive = thread.otherId === activeUserId;
                const otherLabel = getDisplayName(thread.otherId);
                return (
                  <button
                    key={thread.otherId}
                    type="button"
                    onClick={() => setActiveUserId(thread.otherId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-[#FF6500]/10 text-gray-900 dark:text-white"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FF6500]/10 flex items-center justify-center text-[#FF6500] text-xs font-medium">
                      {getInitials(otherLabel)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{otherLabel}</p>
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {thread.last.body}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {moment(thread.last.$createdAt).fromNow(true)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        <div className="sm:col-span-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col max-h-96">
          {activeUserId ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FF6500]/10 flex items-center justify-center text-[#FF6500] text-xs font-medium">
                  {getInitials(getDisplayName(activeUserId))}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {getDisplayName(activeUserId)}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Private conversation
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {currentThread && currentThread.length > 0 ? (
                  currentThread.map((msg) => {
                    const isMine = msg.fromUserId === myId;
                    return (
                      <div
                        key={msg.$id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${
                            isMine
                              ? "bg-[#FF6500] text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="break-words break-all">{msg.body}</p>
                          <p className="mt-1 text-[10px] opacity-70 text-right">
                            {moment(msg.$createdAt).format("HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No messages yet. Say hi!
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 text-xs px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-[#FF6500] text-white text-xs hover:bg-[#FF6500]/90 disabled:opacity-50"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-6 h-6 text-[#FF6500] mb-2" />
              <p>Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

