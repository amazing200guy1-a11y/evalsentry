"use strict";

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgCyan: "\x1b[46m",
};

const BANNER = `
${ANSI.cyan}${ANSI.bold}╔══════════════════════════════════════════════════════════════╗
║   ███████╗██╗   ██╗ █████╗ ██╗     ███████╗███████╗███╗   ██╗ ║
║   ██╔════╝██║   ██║██╔══██╗██║     ██╔════╝██╔════╝████╗  ██║ ║
║   █████╗  ██║   ██║███████║██║     ███████╗█████╗  ██╔██╗ ██║ ║
║   ██╔══╝  ╚██╗ ██╔╝██╔══██║██║     ╚════██║██╔══╝  ██║╚██╗██║ ║
║   ███████╗ ╚████╔╝ ██║  ██║███████╗███████║███████╗██║ ╚████║ ║
║   ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝ ║
║       ${ANSI.white}Deterministic Edge-Case Linter for AI-Generated Code${ANSI.cyan}    ║
╚══════════════════════════════════════════════════════════════╝${ANSI.reset}
`;

const CATEGORIES = {
  financial: {
    name: "Financial Data Integrity",
    icon: "💳",
    severity: "CRITICAL",
    color: ANSI.red,
  },
  security: {
    name: "Web Security & OWASP Defenses",
    icon: "🛡️",
    severity: "HIGH",
    color: ANSI.yellow,
  },
  ecmascript: {
    name: "ECMAScript Runtime Spec Compliance",
    icon: "⚡",
    severity: "MEDIUM",
    color: ANSI.magenta,
  },
  concurrency: {
    name: "Asynchronous UI Concurrency",
    icon: "🔄",
    severity: "HIGH",
    color: ANSI.blue,
  },
  parsers: {
    name: "Agentic Tool Calling & Parser Traps",
    icon: "🤖",
    severity: "MEDIUM",
    color: ANSI.cyan,
  },
};

module.exports = {
  ANSI,
  BANNER,
  CATEGORIES,
};
