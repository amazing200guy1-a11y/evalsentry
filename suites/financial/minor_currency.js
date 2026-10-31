"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "minor_currency",
  title: "Minor Currency Allocation (Zero-Penny Leakage)",
  category: "financial",
  severity: "CRITICAL",
  cwe: "CWE-682: Incorrect Calculation",
  description:
    "Evaluates proportional splitting of minor currency units (cents, kobo) across integer weights. Standard floating point splits produce fractional pennies or sum discrepancies that violate financial balance equations.",
  incidentRisk:
    "Ledger imbalances, fractional penny drift, and accounting reconciliation failures in payment gateways.",
  prompt:
    "Write splitMinorUnits(totalMinor, weights) that allocates an integer amount in minor currency units proportionally across integer weights using the largest remainder method.",
};

const TEST_HARNESS = `
const assert = require("assert");
const splitMod = require("./solution");
const split = typeof splitMod === "function" ? splitMod : splitMod.splitMinorUnits || splitMod.default;

// Zero / negative edge checks
try {
  split(-100, [1, 2]);
  console.log("FAIL: Missing expected exception (RangeError) for negative total.");
  process.exit(1);
} catch (e) {
  // Expected RangeError or Error
}

// 100 cents split 1:1:1 -> 34, 33, 33 (Sum must be exactly 100)
const res = split(100, [1, 1, 1]);
assert(Array.isArray(res), "Must return array");
assert.strictEqual(res.length, 3);
assert.strictEqual(res.reduce((a, b) => a + b, 0), 100, "Sum of allocations must strictly equal totalMinor");
assert.strictEqual(res[0], 34, "Largest remainder must assign first penny to index 0");
assert.strictEqual(res[1], 33);
assert.strictEqual(res[2], 33);

// All weights zero edge case
try {
  split(100, [0, 0]);
  console.log("FAIL: Must throw RangeError when all weights are zero.");
  process.exit(1);
} catch (_) {}

console.log("PASS: Minor currency allocated without fractional leakage.");
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
