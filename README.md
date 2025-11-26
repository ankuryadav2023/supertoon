# Supertoon

## 🔍 What is Supertoon?

Supertoon is a **wrapper over [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon)** that performs extra optimization on JSON data before encoding with TOON format.

It applies multiple optimization strategies:
### Removes empty/null values
Automatically strips: `null`, `undefined`, `""`, `{}`, `[]`.

### Shortens all JSON keys
Generates collision-free short aliases (e.g., `businessDetails` → `b`, `estimateStatus` → `e`).

### Compresses long repeated strings
Extracts large string values into a string table, replacing them with identifiers like `@S1`.

Then passes the optimized result to TOON for maximum compression.

## 📦 Installation

```bash
npm install supertoon
```

## 🔧 Usage

### Step 1: Import

```javascript
import { encode } from 'supertoon';
```

### Step 2: Prepare Your Data

Supertoon accepts:
- ✅ A single object
- ✅ An array of objects

### Step 3: Encode

```javascript
const result = encode(obj);
```

## ⚙️ Options

Customize the encoding behavior with 4 available options:

```javascript
const result = encode(data, {
  allowShortForms: true,        // Shorten keys (default: true)
  allowCleaning: true,           // Remove empty/null values (default: true)
  replaceLongStrings: true,      // Extract long strings (default: true)
  longStringThreshold: 50        // Min length to extract (default: 50 chars)
});
```

## 📤 Return Value

The `encode` function returns an object containing:

```javascript
{
  encodedObj: "...",              // The TOON-encoded string
  keysShortForms: {...},          // Key mapping (if allowShortForms: true)
  replaceLongStringsTable: {...}  // String table (if replaceLongStrings: true)
}
```

## 💡 Use Cases

- **LLM APIs**: Reduce token usage when sending JSON to GPT/Claude/other models
- **Network payloads**: Minimize data transfer size for APIs
- **Storage**: Compress JSON before saving to databases
- **Logging**: Make large JSON logs more compact
