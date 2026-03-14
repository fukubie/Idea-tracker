import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

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
              background: "#FD366E",
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
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
