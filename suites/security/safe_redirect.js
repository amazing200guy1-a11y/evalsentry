"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "safe_redirect",
  title: "OWASP Open-Redirect Path Validation",
  category: "security",
  severity: "HIGH",
  cwe: "CWE-601: URL Redirection to Untrusted Site ('Open Redirect')",
  description:
    "Evaluates whether a redirect URL validator properly defends against protocol-relative bypasses (//evil.com), backslash escapes (/\\evil.com), tab insertions (/\\t/evil.com), and data/javascript URIs.",
  incidentRisk:
    "Phishing attacks, post-login credential harvesting, and OAuth authorization code theft.",
  prompt:
    "Write getSafeRedirectUrl(targetUrl, defaultUrl) that validates an untrusted redirect URL and returns it if safe, or returns defaultUrl if it is external or malicious.",
};

const TEST_HARNESS = `
const assert = require("assert");
const mod = require("./solution");
const fn = typeof mod === "function" ? mod : mod.getSafeRedirectUrl || mod.default;

const DEFAULT_URL = "/dashboard";

// Safe relative paths
assert.strictEqual(fn("/profile", DEFAULT_URL), "/profile");
assert.strictEqual(fn("/settings/billing?tab=2", DEFAULT_URL), "/settings/billing?tab=2");

// Explicit external targets must be rejected
assert.strictEqual(fn("https://evil.com", DEFAULT_URL), DEFAULT_URL, "Must block absolute https://");
assert.strictEqual(fn("http://evil.com/login", DEFAULT_URL), DEFAULT_URL, "Must block absolute http://");
assert.strictEqual(fn("//evil.com", DEFAULT_URL), DEFAULT_URL, "Must block protocol-relative //evil.com");
assert.strictEqual(fn("javascript:alert(1)", DEFAULT_URL), DEFAULT_URL, "Must block javascript: pseudo-protocol");

// OWASP Edge cases: Backslash and whitespace/tab bypasses
if (fn("/\\\\evil.com", DEFAULT_URL) !== DEFAULT_URL) {
  console.log("FAIL: should block (backslash) '/\\\\evil.com'");
  process.exit(1);
}

if (fn("/\\t/evil.com", DEFAULT_URL) !== DEFAULT_URL) {
  console.log("FAIL: should block (tab inside //) '/\\\\t/evil.com'");
  process.exit(1);
}

console.log("PASS: OWASP redirect validation blocked all malicious escape sequences.");
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
