export const RTL_LOCALE_BASES = new Set(["ar", "he"]);

export function normalizeLocaleBase(locale) {
  return locale.split(/[-_]/)[0].toLowerCase();
}

export function isRtlLocale(locale) {
  return RTL_LOCALE_BASES.has(normalizeLocaleBase(locale));
}

/**
 * @param {Document} doc
 * @param {() => string} [getUiLanguage]
 */
export function applyDocumentLocale(
  doc,
  getUiLanguage = () => chrome.i18n.getUILanguage(),
) {
  const locale = getUiLanguage();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  doc.documentElement.setAttribute("lang", locale);
  doc.documentElement.setAttribute("dir", dir);
  return { locale, dir };
}
