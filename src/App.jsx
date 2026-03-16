import { useState, useEffect } from "react";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Messages } from "./pages/Messages";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { VerificationPage } from "./pages/Verification";
import { UserProvider, useUser } from "./lib/context/user";
import { IdeasProvider } from "./lib/context/ideas";
import { MessagesProvider } from "./lib/context/messages";
import { ThemeProvider, useTheme } from "./lib/context/theme";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

const validRoutes = ["/", "/login", "/profile", "/discover", "/verify-email"];

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const { theme, effectiveTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  // Global app background based on effective theme (resolves "system" correctly)
  const backgroundClass =
    effectiveTheme === "light"
      ? "bg-[#E9FCE3]" // light green for light mode
      : "bg-[#C40C0C]"; // dark orange for dark mode

  useEffect(() => {
    const path = window.location.pathname;

    if (!validRoutes.includes(path)) {
      setCurrentPage("404");
      setLoading(false);
      return;
    }

    if (path === "/login") setCurrentPage("login");
    else if (path === "/profile") setCurrentPage("profile");
    else if (path === "/discover") setCurrentPage("discover");
    else if (path === "/verify-email") setCurrentPage("home");
    else setCurrentPage("home");

    const handlePopState = () => {
      const path = window.location.pathname;
      if (!validRoutes.includes(path)) {
        setCurrentPage("404");
        return;
      }
      if (path === "/login") setCurrentPage("login");
      else if (path === "/profile") setCurrentPage("profile");
      else if (path === "/discover") setCurrentPage("discover");
      else if (path === "/verify-email") setCurrentPage("home");
      else setCurrentPage("home");
    };

    window.addEventListener("popstate", handlePopState);
    setLoading(false);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (page) => {
    if (page === "404") {
      setCurrentPage("404");
      return;
    }

    setCurrentPage(page);
    const path = page === "home" ? "/" : `/${page}`;
    window.history.pushState(null, "", path);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  function InnerContent({ currentPage, navigate }) {
    const userContext = useUser();

    if (
      userContext.loading ||
      !userContext.isInitialized ||
      !userContext.userDataLoaded
    ) {
      return (
        <div
          className={`min-h-screen ${backgroundClass} flex flex-col items-center justify-center text-gray-900 dark:text-white`}
        >
          <div className="w-6 h-6 border-2 border-[#FF6500]/30 border-t-[#FF6500] rounded-full animate-spin mb-3"></div>
          <p className="text-sm opacity-80">
            Hang tight… warming up your ideas ✨
          </p>
        </div>
      );
    }

    return (
      <IdeasProvider>
        <MessagesProvider>
          {currentPage !== "404" && (
            <Navbar navigate={navigate} currentPage={currentPage} />
          )}
          <main
            className={`flex-grow ${
              currentPage !== "404" ? "container mx-auto p-4" : ""
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                className="h-full"
              >
                {currentPage === "login" && <Login navigate={navigate} />}
                {currentPage === "profile" && <Profile navigate={navigate} />}
              {currentPage === "home" && <Home navigate={navigate} />}
              {currentPage === "discover" && <Discover navigate={navigate} />}
              {currentPage === "messages" && <Messages navigate={navigate} />}
                {currentPage === "404" && (
                  <div className="h-full flex items-center justify-center">
                    <NotFound navigate={navigate} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
          {currentPage !== "404" && <Footer />}
          <Toaster
            theme="system"
            visibleToasts={3}
            position="top-right"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </MessagesProvider>
      </IdeasProvider>
    );
  }

  return (
    <div
      className={`min-h-screen ${backgroundClass} text-gray-900 dark:text-white transition-colors duration-300 flex flex-col`}
      data-theme={theme}
    >
      <UserProvider>
        <InnerContent currentPage={currentPage} navigate={navigate} />
      </UserProvider>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
