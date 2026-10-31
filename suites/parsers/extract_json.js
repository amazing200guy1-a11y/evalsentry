"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "extract_json",
  title: "Agentic JSON Parser Braces in String Literal",
  category: "parsers",
  severity: "MEDIUM",
  cwe: "CWE-20: Improper Input Validation",
  description:
    "Evaluates whether regex-based or token-based JSON extractors properly handle nested curly braces inside string values. Naive regex parsers match up to the first closing brace, corrupting tool-call payloads in agent workflows.",
  incidentRisk:
    "Agent tool-calling workflow crashes, failed structured data extraction, and broken LLM API pipelines.",
  prompt:
    "Write extractFirstJson(rawText) that extracts and parses the first valid JSON object or array from a mixed markdown or agent response string.",
};

const TEST_HARNESS = `
const assert = require("assert");
const mod = require("./solution");
const fn = typeof mod === "function" ? mod : mod.extractFirstJson || mod.default;

// Simple markdown wrapped JSON
const text1 = "Here is the data: \\n\`\`\`json\\n{\\"action\\": \\"order\\", \\"amount\\": 42}\\n\`\`\`\\nHope that helps!";
const res1 = fn(text1);
assert.strictEqual(res1.action, "order");
assert.strictEqual(res1.amount, 42);

// Tricky case: String contains curly braces inside quotes
const text2 = 'Agent thought: Processing. {"message": "Hello {world} and {user}", "status": "ok"} Thank you.';
let res2;
try {
  res2 = fn(text2);
} catch (e) {
  console.log("FAIL: brace inside string");
  process.exit(1);
}

if (!res2 || res2.status !== "ok" || res2.message !== "Hello {world} and {user}") {
  console.log("FAIL: brace inside string");
  process.exit(1);
}

console.log("PASS: Extracted nested JSON structure despite curly braces inside string literal.");
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
