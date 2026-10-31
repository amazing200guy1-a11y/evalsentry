#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const Reporter = require("../lib/reporter");
const { ANSI } = require("../lib/constants");

// Load all suites
function loadSuites() {
  const suitesDir = path.join(__dirname, "..", "suites");
  const suites = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".js")) {
        const suite = require(fullPath);
        suite.filePath = fullPath;
        suites.push(suite);
      }
    }
  }

  scan(suitesDir);
  return suites;
}

function printHelp() {
  Reporter.printBanner();
  console.log(`
${ANSI.bold}USAGE:${ANSI.reset}
  evalsentry <command> [options]

${ANSI.bold}COMMANDS:${ANSI.reset}
  ${ANSI.cyan}audit <file>${ANSI.reset}          Audit an AI-generated solution file against edge-case suites
  ${ANSI.cyan}demo${ANSI.reset}                  Run an instant side-by-side benchmark of vulnerable vs patched code
  ${ANSI.cyan}list${ANSI.reset}                  List all available production edge-case suites and CWE tags
  ${ANSI.cyan}help${ANSI.reset}                  Display this help screen

${ANSI.bold}OPTIONS:${ANSI.reset}
  ${ANSI.yellow}--suite <id|category>${ANSI.reset}  Filter execution by specific suite ID or category
  ${ANSI.yellow}--html [outputPath]${ANSI.reset}   Generate a standalone visual HTML dashboard (default: evalsentry-report.html)
  ${ANSI.yellow}--quiet${ANSI.reset}               Suppress the welcome banner

${ANSI.bold}EXAMPLES:${ANSI.reset}
  $ evalsentry demo
  $ evalsentry audit ./my-solution.js --suite snowflake_dedupe
  $ evalsentry audit ./my-code.js --html ./audit.html
  $ evalsentry list
`);
}

async function handleAudit(args, suites) {
  const filePath = args[1];
  if (!filePath || filePath.startsWith("--")) {
    console.error(`${ANSI.red}Error: Please specify a file path to audit.${ANSI.reset}`);
    console.log(`Usage: evalsentry audit <path/to/solution.js> [--suite <id>] [--html]`);
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`${ANSI.red}Error: File not found: ${resolved}${ANSI.reset}`);
    process.exit(1);
  }

  const code = fs.readFileSync(resolved, "utf8");
  const suiteFlagIdx = args.indexOf("--suite");
  const suiteFilter = suiteFlagIdx !== -1 ? args[suiteFlagIdx + 1] : null;

  let filteredSuites = suites;
  if (suiteFilter) {
    filteredSuites = suites.filter(
      (s) => s.id === suiteFilter || s.category === suiteFilter
    );
    if (filteredSuites.length === 0) {
      console.error(
        `${ANSI.red}Error: No suites found matching filter '${suiteFilter}'.${ANSI.reset}`
      );
      process.exit(1);
    }
  }

  console.log(
    `\n${ANSI.cyan}${ANSI.bold}► Running EvalSentry audit on: ${ANSI.white}${path.basename(
      resolved
    )}${ANSI.reset} (${filteredSuites.length} suites)...\n`
  );

  const results = [];
  for (const suite of filteredSuites) {
    process.stdout.write(`  [TESTING] ${suite.title}... `);
    const res = suite.run(code);
    results.push({
      ...suite,
      ...res,
    });
    if (res.passed) {
      console.log(`\r  ${ANSI.green}✓ PASS${ANSI.reset}  ${suite.title}`);
    } else {
      console.log(`\r  ${ANSI.red}✗ FAIL${ANSI.reset}  ${suite.title}`);
    }
  }

  Reporter.printSummary(results, path.basename(resolved));

  if (args.includes("--html") || !args.includes("--no-html")) {
    const htmlIdx = args.indexOf("--html");
    const outHtml =
      htmlIdx !== -1 && args[htmlIdx + 1] && !args[htmlIdx + 1].startsWith("--")
        ? path.resolve(process.cwd(), args[htmlIdx + 1])
        : path.resolve(process.cwd(), "evalsentry-report.html");

    Reporter.generateHtmlReport(results, outHtml, path.basename(resolved));
    console.log(
      `${ANSI.cyan}► Interactive HTML report generated at:${ANSI.reset} ${ANSI.bold}${outHtml}${ANSI.reset}\n`
    );
  }
}

async function handleDemo(args, suites) {
  console.log(`\n${ANSI.cyan}${ANSI.bold}► RUNNING INSTANT EVALSENTRY DEMO${ANSI.reset}`);
  console.log(
    `${ANSI.gray}Evaluating raw ChatGPT vulnerable completion vs Patched implementation...${ANSI.reset}\n`
  );

  const demoDir = path.join(__dirname, "..", "demo_solutions");
  const vulnSnowflake = fs.readFileSync(
    path.join(demoDir, "vulnerable_snowflake.js"),
    "utf8"
  );
  const patchSnowflake = fs.readFileSync(
    path.join(demoDir, "patched_snowflake.js"),
    "utf8"
  );
  const vulnRedirect = fs.readFileSync(
    path.join(demoDir, "vulnerable_redirect.js"),
    "utf8"
  );
  const patchRedirect = fs.readFileSync(
    path.join(demoDir, "patched_redirect.js"),
    "utf8"
  );

  const snowflakeSuite = suites.find((s) => s.id === "snowflake_dedupe");
  const redirectSuite = suites.find((s) => s.id === "safe_redirect");

  const results = [];

  if (snowflakeSuite) {
    const r1 = snowflakeSuite.run(vulnSnowflake);
    results.push({
      ...snowflakeSuite,
      ...r1,
      title: "Snowflake Dedupe (ChatGPT Unpatched)",
    });

    const r2 = snowflakeSuite.run(patchSnowflake);
    results.push({
      ...snowflakeSuite,
      ...r2,
      title: "Snowflake Dedupe (EvalSentry Hardened)",
    });
  }

  if (redirectSuite) {
    const r3 = redirectSuite.run(vulnRedirect);
    results.push({
      ...redirectSuite,
      ...r3,
      title: "OWASP Redirect (AI Assistant Default)",
    });

    const r4 = redirectSuite.run(patchRedirect);
    results.push({
      ...redirectSuite,
      ...r4,
      title: "OWASP Redirect (Strict RFC Hardened)",
    });
  }

  Reporter.printSummary(results, "Demo Side-by-Side Comparison");

  const outHtml = path.resolve(process.cwd(), "evalsentry-demo-report.html");
  Reporter.generateHtmlReport(results, outHtml, "Demo Side-by-Side Comparison");
  console.log(
    `${ANSI.cyan}► Interactive HTML report generated at:${ANSI.reset} ${ANSI.bold}${outHtml}${ANSI.reset}\n`
  );
}

function handleList(suites) {
  Reporter.printBanner();
  console.log(`${ANSI.bold}BUILT-IN PRODUCTION EDGE-CASE SUITES:${ANSI.reset}\n`);

  for (const s of suites) {
    console.log(
      `  ${ANSI.cyan}${ANSI.bold}${s.id.padEnd(24)}${ANSI.reset} [${s.category.toUpperCase()}] ${
        s.severity === "CRITICAL" ? ANSI.red : ANSI.yellow
      }${s.severity}${ANSI.reset}`
    );
    console.log(`    ${ANSI.white}${s.title}${ANSI.reset}`);
    console.log(`    ${ANSI.gray}CWE: ${s.cwe || "N/A"}${ANSI.reset}`);
    console.log(`    ${ANSI.dim}${s.description}${ANSI.reset}\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  if (!args.includes("--quiet") && command !== "help") {
    Reporter.printBanner();
  }

  const suites = loadSuites();

  switch (command) {
    case "audit":
      await handleAudit(args, suites);
      break;
    case "demo":
      await handleDemo(args, suites);
      break;
    case "list":
      handleList(suites);
      break;
    case "help":
    case "--help":
    case "-h":
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error(`\n${ANSI.red}Fatal Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
