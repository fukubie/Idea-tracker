import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export function AIPitch({ idea, isOpen, onClose, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitch, setPitch] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPitch(idea?.aiPitch || "");
    }
  }, [isOpen, idea?.aiPitch]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate(idea);
      if (result) {
        setPitch(result);
      }
    } catch (error) {
      console.log("Pitch error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatInlineContent = (text) => {
    if (!text) return text;

    // Escape HTML first to prevent XSS from AI output,
    // then apply minimal markdown-style formatting.
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let formatted = escaped
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-medium text-gray-800 dark:text-gray-100">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-[#FD366E] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      );

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const formatPitch = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let currentList = [];
    let listType = null;

    const flushList = () => {
      if (currentList.length) {
        elements.push(
          <ul key={`list-${elements.length}`} className="ml-4 mb-3 space-y-1">
            {currentList}
          </ul>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return flushList();

      if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-lg font-medium my-3 text-[#FD366E]"
          >
            {trimmed.slice(3)}
          </h3>
        );
      } else if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-md font-medium my-2 text-[#FD366E]"
          >
            {trimmed.slice(4)}
          </h4>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (listType !== "ordered") flushList(), (listType = "ordered");
        currentList.push(
          <li
            key={`ol-${i}`}
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {formatInlineContent(trimmed.replace(/^\d+\.\s/, ""))}
          </li>
        );
      } else if (/^[-*•]\s/.test(trimmed)) {
        if (listType !== "unordered") flushList(), (listType = "unordered");
        currentList.push(
          <li
            key={`ul-${i}`}
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc ml-4"
          >
            {formatInlineContent(trimmed.replace(/^[-*•]\s/, ""))}
          </li>
        );
      } else if (/^\*\*.*\*\*$/.test(trimmed)) {
        flushList();
        elements.push(
          <p
            key={`bold-${i}`}
            className="text-sm font-medium text-gray-800 dark:text-gray-200 my-2"
          >
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      } else {
        flushList();
        elements.push(
          <p
            key={`p-${i}`}
            className="text-sm text-gray-700 dark:text-gray-300 my-2 leading-relaxed"
          >
            {formatInlineContent(trimmed)}
          </p>
        );
      }
    });

    flushList();
    return <div className="space-y-1">{elements}</div>;
  };

  const formatDate = (date) => moment(date).format("MMM D, YYYY h:mm A");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl break-words"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-[#FD366E] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-900 dark:text-white">
                    AI Pitch by Gemini
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[180px] break-words">
                    {idea?.title || "Untitled Idea"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pitch && (
                  <motion.button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-2 py-1.5 text-sm rounded-md bg-[#FD366E] hover:bg-[#FD366E]/90 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Copy className="w-3 h-3 text-white" />
                    )}
                    <span className="text-xs font-medium text-white">
                      {copied ? "Copied" : "Copy"}
                    </span>
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 overflow-y-auto max-h-[calc(90vh-100px)] break-words overflow-wrap-anywhere">
            {!pitch ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-[#FD366E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  Need a clear pitch?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-xs mx-auto">
                  Generate a concise pitch deck outline tailored to this idea.
                </p>
                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-[#FD366E] hover:bg-[#FD366E]/90 disabled:bg-[#FD366E]/50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 mx-auto"
                  whileHover={!isGenerating ? { scale: 1.02 } : {}}
                  whileTap={!isGenerating ? { scale: 0.97 } : {}}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Generate Pitch</span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {idea?.pitchGeneratedAt && (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span>
                      Generated on {formatDate(idea.pitchGeneratedAt)}
                    </span>
                    <motion.button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                      whileHover={!isGenerating ? { scale: 1.02 } : {}}
                      whileTap={!isGenerating ? { scale: 0.97 } : {}}
                    >
                      {isGenerating ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 text-[#FD366E]" />
                      )}
                      <span className="text-gray-800 dark:text-white font-medium">
                        {isGenerating ? "Regenerating..." : "Regenerate"}
                      </span>
                    </motion.button>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3">
                  <div className="prose prose-sm max-w-none">
                    {formatPitch(pitch)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

