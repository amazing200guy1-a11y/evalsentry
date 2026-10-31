"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "regex_statefulness",
  title: "ECMAScript Stateful RegExp /g Mutation",
  category: "ecmascript",
  severity: "MEDIUM",
  cwe: "CWE-674: Uncontrolled Recursion / State Desynchronization",
  description:
    "Evaluates whether a text filter or validator uses stateful RegExp instances with the /g flag. When /g is queried multiple times via RegExp.prototype.test(), the engine mutates lastIndex, causing consecutive identical checks to flip alternately between true and false.",
  incidentRisk:
    "Content filtering leaks, silent bypass of input sanitizers, and unpredictable authorization filter behavior.",
  prompt:
    "Write createContentFilter(bannedWords) that returns a function isFlagged(text) returning true if any banned word is present in the input text.",
};

const TEST_HARNESS = `
const assert = require("assert");
const mod = require("./solution");
const createFilter = typeof mod === "function" ? mod : mod.createContentFilter || mod.default;

const isFlagged = createFilter(["scam", "phishing", "fraud"]);

// First check
const sample = "This is an urgent fraud notification";
const firstCheck = isFlagged(sample);
assert.strictEqual(firstCheck, true, "First check on banned text must return true");

// Second consecutive check on EXACT same string
const secondCheck = isFlagged(sample);
if (secondCheck !== true) {
  console.log("FAIL: repeat isFlagged call with same text must also return true (RegExp /g statefulness bug)");
  process.exit(1);
}

// Third check
assert.strictEqual(isFlagged(sample), true, "Third call must still return true");

// Clean text
assert.strictEqual(isFlagged("Hello, your payment receipt is ready"), false, "Clean text must return false");

console.log("PASS: RegExp pattern is completely stateless across consecutive calls.");
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
