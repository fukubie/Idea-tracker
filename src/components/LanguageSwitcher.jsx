import { Component } from "react";
import { LocaleSwitcher } from "lingo.dev/react/client";

class LocaleSwitcherBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function LanguageSwitcher() {
  return (
    <LocaleSwitcherBoundary>
      <div className="language-switcher-container">
        <LocaleSwitcher
          locales={["en", "es", "fr", "ru", "de"]}
          defaultLocale="en"
          className="themed-language-switcher"
        />
      </div>
    </LocaleSwitcherBoundary>
  );
}
