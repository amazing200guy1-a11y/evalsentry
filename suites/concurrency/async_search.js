"use strict";

const { runSandbox } = require("../../lib/runner");

const METADATA = {
  id: "async_search",
  title: "Out-of-Order Async Response Race Condition",
  category: "concurrency",
  severity: "HIGH",
  cwe: "CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')",
  description:
    "Evaluates asynchronous search runners against delayed out-of-order network responses. If a runner only compares (latestQuery === query), an older delayed response for the current query will overwrite a newer fresher response upon refresh.",
  incidentRisk:
    "UI data corruption, stale search feeds overwriting live user state, and conflicting telemetry events.",
  prompt:
    "Write createSearchRunner(fetchFn, onResult) that handles rapid search-as-you-type inputs and guarantees only the freshest response updates the UI, ignoring any older out-of-order responses.",
};

const TEST_HARNESS = `
const assert = require("assert");
const mod = require("./solution");
const createRunner = typeof mod === "function" ? mod : mod.createSearchRunner || mod.default;

async function runTest() {
  const rendered = [];
  
  // Simulated asynchronous network fetch with controllable latency
  let delayedResolve;
  const delayedPromise = new Promise((resolve) => { delayedResolve = resolve; });

  let callCount = 0;
  const fetchFn = async (query) => {
    callCount++;
    if (callCount === 1) {
      // First call for 'apple' hangs until we manually release it
      return await delayedPromise;
    }
    // Second call for 'apple' resolves immediately
    return "RESULT_NEW_FRESH";
  };

  const runner = createRunner(fetchFn, (result) => {
    rendered.push(result);
  });

  // User searches 'apple'
  runner.search("apple");

  // User refreshes / searches 'apple' again quickly
  runner.search("apple");

  // Wait a tick for second search to complete and render
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(rendered[rendered.length - 1], "RESULT_NEW_FRESH", "Fresh result should be rendered first");

  // Now the old, delayed first request finally arrives!
  delayedResolve("RESULT_OLD_STALE");
  await new Promise((r) => setTimeout(r, 50));

  // The UI MUST NOT have reverted to the stale result!
  const finalRender = rendered[rendered.length - 1];
  if (finalRender === "RESULT_OLD_STALE") {
    console.log("FAIL: older response for the SAME query must not overwrite a newer one");
    process.exit(1);
  }

  console.log("PASS: Concurrency runner correctly rejected stale out-of-order response.");
}

runTest().catch((err) => {
  console.log("FAIL: Unhandled exception in concurrency runner: " + err.message);
  process.exit(1);
});
`;

module.exports = {
  ...METADATA,
  run: (code) => runSandbox(code, TEST_HARNESS),
};
