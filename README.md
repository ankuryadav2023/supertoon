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
import { encode, decode } from 'supertoon';
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

> **⚠️ Important for Decoding:** If you plan to decode the data later and need to recover the original structure, set `allowCleaning: false`. Empty/null values (`null`, `undefined`, `""`, `{}`, `[]`) that are removed during encoding **cannot be restored** during decoding.

## 📤 Return Value

The `encode` function returns an object containing:

```javascript
{
  encodedObj: "...",              // The TOON-encoded string
  keysShortForms: {...},          // Key mapping (if allowShortForms: true)
  replaceLongStringsTable: {...}  // String table (if replaceLongStrings: true)
}
```

## 🔄 Decoding

### Basic Usage

To decode and restore your original JSON structure:

```javascript
import { encode, decode } from 'supertoon';

// Encode
const originalData = {
  name: "John",
  phone: "1234567890",
  metadata: null,
  tags: []
};

const encoded = encode(originalData);

// Decode - pass the entire encoded result object
const decoded = decode(encoded);
console.log(decoded);
```

### Important Notes

1. **Lost Values:** Values removed by `allowCleaning` (empty/null values) **cannot be restored**. They are permanently removed during encoding.

2. **For Full Recovery:** If you need to decode and get back the exact original structure, set `allowCleaning: false`:

```javascript
// Encode without cleaning to preserve all values
const encoded = encode(originalData, {
  allowCleaning: false  // Preserve null, undefined, empty strings/arrays/objects
});

// Now decode will restore the complete structure
const decoded = decode(encoded);
```

3. **Required Data:** The `decode` function requires the complete encoded result object (including `encodedObj`, and optionally `keysShortForms` and `replaceLongStringsTable`).

### Decode Example

```javascript
const data = {
  businessDetails: {
    companyName: "Acme Corp",
    description: "A very long description that exceeds 50 characters and will be extracted into the string table"
  },
  estimateStatus: "pending",
  metadata: null
};

// Encode
const result = encode(data);
// {
//   encodedObj: "...",
//   keysShortForms: { businessDetails: "b", companyName: "c", ... },
//   replaceLongStringsTable: { "@S1": "A very long description..." }
// }

// Decode
const restored = decode(result);
// {
//   businessDetails: {
//     companyName: "Acme Corp",
//     description: "A very long description..."
//   },
//   estimateStatus: "pending"
//   // Note: metadata: null is lost if allowCleaning was true
// }
```

## 💡 Use Cases

- **LLM APIs**: Reduce token usage when sending JSON to GPT/Claude/other models
- **Network payloads**: Minimize data transfer size for APIs
- **Storage**: Compress JSON before saving to databases
- **Logging**: Make large JSON logs more compact
