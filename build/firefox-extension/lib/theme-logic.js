export const THEME_AUTO = "auto";
export const THEME_DARK = "dark";
export const THEME_LIGHT = "light";
export const AVAILABLE_THEMES = [THEME_AUTO, THEME_DARK, THEME_LIGHT];

/**
 * @param {(query: string) => MediaQueryList} [matchMediaFn]
 * @returns {"dark" | "light"}
 */
export function getSystemTheme(matchMediaFn = globalThis.matchMedia?.bind(globalThis)) {
  if (matchMediaFn?.("(prefers-color-scheme: dark)")?.matches) {
    return THEME_DARK;
  }
  return THEME_LIGHT;
}

/**
 * @param {string} theme
 * @param {(query: string) => MediaQueryList} [matchMediaFn]
 * @returns {"dark" | "light"}
 */
export function resolveTheme(theme, matchMediaFn) {
  return theme === THEME_AUTO ? getSystemTheme(matchMediaFn) : theme;
}

/**
 * @param {string} theme
 * @param {Document} doc
 * @param {(query: string) => MediaQueryList} [matchMediaFn]
 * @returns {"dark" | "light"}
 */
export function applyTheme(theme, doc, matchMediaFn) {
  const resolvedTheme = resolveTheme(theme, matchMediaFn);
  doc.documentElement.setAttribute("data-theme", resolvedTheme);
  return resolvedTheme;
}
