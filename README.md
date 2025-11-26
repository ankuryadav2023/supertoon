# supertoon

supertoon is a lightweight utility that transforms heavy JSON into a compact, optimized, "toonified" representation.

It removes unnecessary values, shortens keys, and compresses long repeated strings into a reusable reference table — helping reduce LLM token usage, shrink payload size.

**Tagline:** Optimized JSON-TOON encoding.

## 🚀 Features

### Removes empty/null values
Automatically strips: `null`, `undefined`, `""`, `{}`, `[]`.

### Shortens all JSON keys
Generates collision-free short aliases (e.g., `businessDetails` → `b`, `estimateStatus` → `e`).

### Compresses long repeated strings
Extracts large string values into a string table, replacing them with identifiers like `@S1`.

### Works recursively
Handles complex, deeply nested JSON structures.

### LLM friendly
Reduces token count with no loss of meaning.
