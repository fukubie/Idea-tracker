import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      className="bg-[#FFFFFF]/50 dark:bg-[#000000]/50 backdrop-blur-sm sticky bottom-0 w-full border-t border-gray-200/30 dark:border-gray-800/30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        <motion.div
          className="flex justify-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="font-semibold">
            <span className="text-black dark:text-white">Ver</span>
            <span className="text-[#FF6500]">Qyx</span>
          </span>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;
