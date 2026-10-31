# EvalSentry 🛡️
> **Deterministic Edge-Case Linter & Stress-Testing Sandbox for AI-Generated Code**

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-orange.svg?style=flat-square)]()
[![Deterministic Grader](https://img.shields.io/badge/Grader-Zero--LLM--Judge-cyan.svg?style=flat-square)]()

---

## ⚡ The Problem: Why AI Code Silently Breaks in Production
Frontier AI code assistants (**ChatGPT, Claude, Copilot, DeepSeek, Gemini**) produce syntax that looks impeccably polished:
* Clean variable naming and modular helpers
* Comprehensive JSDoc comments and typing annotations
* Confident language like *"production-ready," "strictly safe," and "fully handles edge cases."*

However, **traditional code review and standard linters only inspect syntax and structure**. They do not test runtime boundary contracts:

| Hidden Failure Class | Silent Consequence | Industry Impact |
|---|---|---|
| **64-bit Integer Precision Truncation** | Standard `JSON.parse()` silently collapses Snowflake / database IDs above $2^{53} - 1$, dropping distinct records | **Financial / Data Loss** |
| **OWASP Redirect Escapes** | URL validators allow `/\evil.com` or `/\t/evil.com` to bypass domain protocol checks | **Authentication Hijacking** |
| **Stateful RegExp `/g` Mutation** | Reusing a global regex causes `lastIndex` mutation, oscillating alternating `true`/`false` checks on identical strings | **Sanitization Leakage** |
| **Out-of-Order Async Race Conditions** | Comparing `latest === query` in search inputs allows slow responses to overwrite newer queries upon user refresh | **UI State Corruption** |

**EvalSentry** is an ultra-fast, zero-dependency CLI that runs AI-generated functions inside isolated execution sandboxes against strict deterministic boundary assertion suites.

---

## 🚀 Quickstart (Zero Installation Required)

Clone the repository and run the instant demo:

```bash
# Clone repository
git clone https://github.com/usman-bamidele/eval-sentry.git
cd eval-sentry

# Run side-by-side demo (ChatGPT vs Hardened implementation)
node bin/evalsentry.js demo
```

You will see instant ANSI color-coded terminal diagnostics and an interactive **dark-mode HTML report** (`evalsentry-demo-report.html`) generated in your directory!

---

## 💻 CLI Usage

### 1. Audit a Specific AI-Generated File
```bash
# Audit against all suites
node bin/evalsentry.js audit ./my-solution.js

# Audit against a specific vulnerability suite
node bin/evalsentry.js audit ./my-solution.js --suite snowflake_dedupe

# Custom HTML report output path
node bin/evalsentry.js audit ./my-solution.js --html ./reports/audit-result.html
```

### 2. List All Built-In Edge-Case Suites
```bash
node bin/evalsentry.js list
```

---

## 🏗️ Architecture

```
                       ┌──────────────────────────────┐
                       │     AI-Generated Code        │
                       │   (ChatGPT / Claude / etc)   │
                       └──────────────┬───────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      EvalSentry CLI       │
                        └─────────────┬─────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│       Isolated Node.js Sandbox       │     │     Production Assertion Matrix      │
│  - Ephemeral tmpdir execution        │     │  - IEEE-754 64-bit sequence IDs      │
│  - Process signal trapping           │     │  - Protocol-relative OWASP bypasses  │
│  - Strict timeout watchdog (5000ms)  │     │  - Stateful regex lastIndex drift    │
└──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘
                   │                                            │
                   └────────────────────┬───────────────────────┘
                                        │
                                        ▼
                   ┌────────────────────────────────────────┐
                   │    Deterministic Grader (Zero-LLM)     │
                   │    - Exit code 0 / assertion parsing   │
                   │    - Microsecond timing latency        │
                   └────────────────────┬───────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │   Color-Coded Terminal UI   │               │   Standalone HTML Report    │
  │   - Real-time PASS/FAIL     │               │   - Single-file zero-CSS-dep │
  │   - CWE tags & failure line │               │   - High-end dark mode UI   │
  └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 📊 Built-In Edge-Case Suites

1. **`snowflake_dedupe`** (CWE-681 — CRITICAL)  
   Verifies that 64-bit Snowflake / Stripe / Twitter sequence IDs exceeding $2^{53} - 1$ are not truncated into floating-point doubles.
2. **`safe_redirect`** (CWE-601 — HIGH)  
   Validates untrusted URL redirection against protocol-relative bypasses (`//evil.com`), backslash escapes (`/\evil.com`), and tab insertions (`/\t/evil.com`).
3. **`regex_statefulness`** (CWE-674 — MEDIUM)  
   Detects stateful RegExp instances with the `/g` flag whose `lastIndex` mutation causes alternating pass/fail responses on repeated queries.
4. **`async_search`** (CWE-362 — HIGH)  
   Validates search-as-you-type concurrency against delayed network responses to guarantee stale responses never overwrite newer fresh queries.
5. **`minor_currency`** (CWE-682 — CRITICAL)  
   Ensures proportional allocation of minor currency units (cents/kobo) uses the largest remainder method with zero penny leakage.
6. **`extract_json`** (CWE-20 — MEDIUM)  
   Ensures agent tool-call JSON extractors do not truncate prematurely when string literals contain nested `{` and `}` curly braces.

---

## 🎨 Interactive HTML Dashboard
EvalSentry automatically produces a single-file, zero-dependency HTML dashboard complete with:
- Risk score posture (Production Hardened vs Critical Defects Found)
- Latency benchmarks per suite
- CWE vulnerability mapping
- Detailed failure diagnostics

---

## 📜 License
MIT License. Built for developer productivity and AI code reliability.
