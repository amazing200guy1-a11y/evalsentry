/**
 * Vulnerable redirect validator:
 * Checks if URL starts with '/' but misses backslashes and tab character protocol bypasses.
 */
function getSafeRedirectUrl(targetUrl, defaultUrl) {
  if (!targetUrl || typeof targetUrl !== "string") return defaultUrl;
  
  // Naive check: starts with single slash
  if (targetUrl.startsWith("/") && !targetUrl.startsWith("//")) {
    return targetUrl; // Vulnerable to /\evil.com and /\t/evil.com
  }
  
  return defaultUrl;
}

module.exports = getSafeRedirectUrl;
