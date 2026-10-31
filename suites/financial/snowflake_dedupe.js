"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "snowflake_dedupe",
  title: "64-Bit Snowflake Integer Precision (IEEE-754)",
  category: "financial",
  severity: "CRITICAL",
  cwe: "CWE-681: Incorrect Conversion between Numeric Types",
  description:
    "Evaluates whether JSON parsing preserves full 64-bit precision on IDs larger than 2^53 - 1. Standard JSON.parse converts IDs to floating point doubles, causing distinct adjacent records to collide and get deleted.",
  incidentRisk:
    "Data corruption & silent transaction deletion in distributed financial databases (Snowflake, Stripe, Discord, Twitter sequence IDs).",
  prompt:
    "Write a JavaScript function dedupeRecords(jsonString) that parses an array of records with 64-bit integer 'id' fields and returns an array with duplicate IDs removed, preserving first occurrence.",
};

const TEST_HARNESS = `
const assert = require("assert");
const dedupe = require("./solution");
const fn = typeof dedupe === "function" ? dedupe : dedupe.dedupeRecords || dedupe.default;

// Normal ID check
const simple = JSON.stringify([{ id: "1", name: "A" }, { id: "2", name: "B" }, { id: "1", name: "Dup" }]);
const res1 = fn(simple);
assert.strictEqual(res1.length, 2, "Simple deduplication failed");

// 64-bit integer boundary check (Exceeding Number.MAX_SAFE_INTEGER = 9007199254740991)
// 1758492367891234816 and 1758492367891234817 round to identical double in standard JSON.parse
const rawJson = '[{"id": 1758492367891234816, "val": "tx_1"}, {"id": 1758492367891234817, "val": "tx_2"}, {"id": 1758492367891234816, "val": "tx_duplicate"}]';

let res2;
try {
  res2 = fn(rawJson);
} catch (e) {
  console.log("FAIL: Threw exception on 64-bit payload: " + e.message);
  process.exit(1);
}

if (!Array.isArray(res2)) {
  console.log("FAIL: Expected array return value");
  process.exit(1);
}

if (res2.length !== 2) {
  console.log("FAIL: ids must keep full precision and dedupe exactly. Expected 2 distinct items, got " + res2.length + ". (IEEE-754 double precision collision detected)");
  process.exit(1);
}

const idA = String(res2[0].id);
const idB = String(res2[1].id);

if (idA === idB || !idA.endsWith("816") || !idB.endsWith("817")) {
  console.log("FAIL: 64-bit precision truncated into double: " + idA + " vs " + idB);
  process.exit(1);
}

console.log("PASS: 64-bit Snowflake precision preserved without truncation.");
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
