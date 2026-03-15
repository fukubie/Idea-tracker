import React, { Component, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { LingoProvider } from "lingo.dev/react/client";
import { getDictionaryForLocale } from "./lingo/getDictionaryForLocale";

function getLocaleCookie() {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|; )lingo-locale=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : "en";
}

function AppWithTranslations() {
  const [dictionary, setDictionary] = useState(null);
  const [locale, setLocale] = useState(() => getLocaleCookie());

  useEffect(() => {
    let cancelled = false;
    getDictionaryForLocale(locale).then((d) => {
      if (!cancelled) setDictionary(d);
    });
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    const handler = (event) => {
      const newLocale = event?.detail?.locale;
      if (!newLocale) return;

      setLocale(newLocale);
    };

    window.addEventListener("lingo-locale-changed", handler);
    return () => window.removeEventListener("lingo-locale-changed", handler);
  }, [locale]);

  if (!dictionary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f4f7] dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300">
        <img src="/images/logo%20(2).png" alt="VerQyx" className="h-16 w-auto object-contain mb-4 opacity-90" />
        <div className="w-6 h-6 border-2 border-[#FF6500]/30 border-t-[#FF6500] rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <LingoProvider dictionary={dictionary}>
      <App />
    </LingoProvider>
  );
}

class RootErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App failed to load:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#f4f4f7",
            color: "#1f2937",
          }}
        >
          <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 16, textAlign: "center" }}>
            Open the browser console (F12) for details. If you haven&apos;t set up
            Appwrite yet, copy <code>.env.example</code> to <code>.env</code> and
            add your keys.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              background: "#FF6500",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AppWithTranslations />
    </RootErrorBoundary>
  </React.StrictMode>
);
