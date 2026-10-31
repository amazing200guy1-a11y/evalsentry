/**
 * Patched redirect validator:
 * Strictly verifies against OWASP open-redirect edge cases:
 * Disallows backslashes, tabs, whitespace, control characters, and relative protocol indicators.
 */
function getSafeRedirectUrl(targetUrl, defaultUrl) {
  if (!targetUrl || typeof targetUrl !== "string") return defaultUrl;

  const trimmed = targetUrl.trim();

  // Block control characters, tabs, backslashes, and newlines
  if (/[\u0000-\u001f\\<>"]/.test(trimmed)) {
    return defaultUrl;
  }

  // Must start with single slash, not double slash or slash-backslash
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    try {
      // Resolve against dummy base to verify it remains same origin
      const parsed = new URL(trimmed, "http://localhost");
      if (parsed.origin === "http://localhost") {
        return trimmed;
      }
    } catch (_) {}
  }

  return defaultUrl;
}

module.exports = getSafeRedirectUrl;
