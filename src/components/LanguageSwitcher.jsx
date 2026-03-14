import { Component, useState, useEffect } from "react";

const LOCALE_COOKIE = "lingo-locale";
const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" },
];

function getLocaleFromCookie() {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "en";
}

function setLocaleCookie(locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

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

function LanguageSwitcherSelect() {
  const [locale, setLocale] = useState(getLocaleFromCookie());

  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  const handleChange = (e) => {
    const newLocale = e.target.value;
    setLocaleCookie(newLocale);
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <div className="language-switcher-container">
      <select
        value={locale}
        onChange={handleChange}
        className="themed-language-switcher"
        aria-label="Select language"
      >
        {LOCALES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LanguageSwitcher() {
  return (
    <LocaleSwitcherBoundary>
      <LanguageSwitcherSelect />
    </LocaleSwitcherBoundary>
  );
}
