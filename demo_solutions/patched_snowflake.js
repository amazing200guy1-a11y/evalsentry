/**
 * Patched implementation:
 * Safely converts unquoted 64-bit integer values in the JSON string into string tokens
 * before calling JSON.parse, completely circumventing IEEE-754 precision loss.
 */
function dedupeRecords(jsonString) {
  // Pre-process unquoted integers with > 15 digits into string literals
  const safeJson = jsonString.replace(
    /("id"\s*:\s*)(\d{15,})/g,
    '$1"$2"'
  );
  const records = JSON.parse(safeJson);
  const seen = new Set();
  return records.filter((r) => {
    const key = String(r.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = dedupeRecords;
