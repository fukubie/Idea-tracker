/**
 * Resolves the full Lingo dictionary to a per-locale dictionary
 * in the shape LingoComponent expects: files[fileKey].entries[entryKey] = string for locale.
 */
const DEFAULT_LOCALE = "en";

export async function getDictionaryForLocale(locale) {
  const full = (await import("./dictionary.js")).default;
  if (!full?.files) {
    return { files: {} };
  }

  const files = {};
  for (const [fileKey, file] of Object.entries(full.files)) {
    if (!file?.entries) continue;
    files[fileKey] = { entries: {} };
    for (const [entryKey, entry] of Object.entries(file.entries)) {
      const content = entry?.content;
      const text =
        (typeof content === "object" && (content[locale] ?? content[DEFAULT_LOCALE])) ||
        (typeof content === "string" ? content : null) ||
        entryKey;
      files[fileKey].entries[entryKey] = text;
    }
  }

  return {
    ...full,
    files,
    locale: locale || DEFAULT_LOCALE,
  };
}
