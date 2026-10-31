"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

/**
 * Executes a code snippet against a test harness inside an isolated temporary directory.
 * Returns { passed: boolean, message: string, durationMs: number }
 */
function runSandbox(userCode, testHarnessCode, timeoutMs = 5000) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "evalsentry-"));
  const solutionPath = path.join(tmpDir, "solution.js");
  const testPath = path.join(tmpDir, "test.js");

  const start = Date.now();
  try {
    fs.writeFileSync(solutionPath, userCode, "utf8");
    fs.writeFileSync(testPath, testHarnessCode, "utf8");

    const stdout = execFileSync(process.execPath, [testPath], {
      cwd: tmpDir,
      timeout: timeoutMs,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const durationMs = Date.now() - start;
    const lines = stdout.trim().split("\n");
    const passLine = lines.find((l) => l.startsWith("PASS"));

    return {
      passed: true,
      message: passLine || "PASS: All boundary assertions satisfied.",
      durationMs,
      stdout: stdout.trim(),
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    if (err.killed || err.signal === "SIGTERM") {
      return {
        passed: false,
        message: "FAIL: Execution timed out (infinite loop or unhandled promise hang).",
        durationMs,
        stdout: "",
      };
    }

    const output = ((err.stdout || "") + "\n" + (err.stderr || "")).trim();
    const failLine = output
      .split("\n")
      .find((l) => l.startsWith("FAIL:") || l.includes("Error:"));

    return {
      passed: false,
      message: failLine || "FAIL: Test assertion failed or runtime exception thrown.",
      durationMs,
      stdout: output,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

module.exports = {
  runSandbox,
};
