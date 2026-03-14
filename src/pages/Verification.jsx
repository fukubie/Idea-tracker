import { useState } from "react";
import { useUser } from "../lib/context/user";
import { motion } from "framer-motion";
import { Mail, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function VerificationPage() {
  const { current: user, sendVerificationEmail, logout } = useUser();
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    const success = await sendVerificationEmail();
    setIsSending(false);
    if (success) {
      toast.success("Verification email resent! Check your inbox.");
    }
  };

  if (!user) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4 bg-[#f4f4f7] dark:bg-[#000000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#FF6500]/30 border-t-[#FF6500] rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-[#f4f4f7] dark:bg-[#000000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-[#000000] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-none text-center">
        <Mail className="w-12 h-12 text-[#FF6500] mx-auto mb-4" />
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Check your inbox at <strong>{user.email}</strong> and verify your
          email to continue using Idea Tracker.
        </p>
        <motion.button
          onClick={handleResend}
          disabled={isSending}
          className="bg-[#FF6500] hover:bg-[#FF6500]/90 disabled:bg-[#FF6500]/50 text-white font-medium py-1 px-4 rounded-lg transition-all w-full mb-4 flex items-center justify-center space-x-2"
          whileHover={!isSending ? { scale: 1.02 } : {}}
          whileTap={!isSending ? { scale: 0.98 } : {}}
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <span>Resend Email</span>
          )}
        </motion.button>
        <button
          onClick={logout}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center space-x-1 mx-auto text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
}
