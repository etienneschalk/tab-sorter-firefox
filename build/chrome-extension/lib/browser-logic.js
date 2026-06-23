/**
 * True when running the Firefox build (manifest includes gecko settings).
 * The Chrome build strips browser_specific_settings at pack time.
 */
export function isFirefoxExtension(
  getManifest = () => chrome.runtime.getManifest(),
) {
  return Boolean(getManifest().browser_specific_settings?.gecko);
}
