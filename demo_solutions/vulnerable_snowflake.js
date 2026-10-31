/**
 * Vulnerable implementation typical of ChatGPT / Claude completions:
 * Uses standard JSON.parse which converts 64-bit numbers above Number.MAX_SAFE_INTEGER
 * to IEEE-754 doubles, silently corrupting precision and dropping distinct IDs.
 */
function dedupeRecords(jsonString) {
  const records = JSON.parse(jsonString);
  const seen = new Set();
  return records.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

module.exports = dedupeRecords;
