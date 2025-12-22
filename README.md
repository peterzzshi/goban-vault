# Goban Vault

A novel approach to cryptographic key storage: encode encryption keys as valid Go (Baduk/Weiqi) board positions. Keys are hidden in plain sight as natural-looking game positions on a 19×19 board.

## Motivation

**Why hide keys in Go boards?**

Traditional key storage methods (files, databases, password managers) are obvious targets. Goban Vault provides **steganographic security** - your 256-bit encryption key looks like an ordinary Go game position. An observer sees a plausible board state, not encrypted data.

**Use Cases:**
- 🔐 **Plausible deniability** - Store keys in images of Go games
- 🎭 **Steganography** - Embed keys in public Go game databases
- 📚 **Physical backup** - Print Go boards on paper (survives digital threats)
- 🧠 **Memorable storage** - Visual patterns are easier to remember than hex strings
- 🎨 **Covert communication** - Share keys disguised as game positions

## Features

- 🔐 Encode 256-bit keys as valid Go board positions
- 👻 **Phantom Go → Real Go**: Progressive encoding from uniform (white) to natural (mixed colours)
- ✅ All positions follow Go rules (no captured groups)
- 🔄 Perfect decoding - recovers original key exactly
- 🎲 Deterministic dummy stones for natural appearance

## How It Works

### The Encoding Concept

1. **256 bits = 4 quadrants × 64 bits**
   - The 19×19 board is divided into 4 quadrants (9×9 each) by center lines
   - Each quadrant encodes 64 bits in its first 64 positions (row-by-row)

2. **Stone Placement = Data**
   - Stone present = `1`, empty = `0`
   - Position matters, colour doesn't (for decoding)

3. **Dummy Stones = Natural Appearance**
   - Each quadrant has 81 positions, but only uses 64 for data
   - Remaining 17 positions filled with deterministic "dummy" stones
   - Makes the board look like a real game, not a data structure

### Phantom Go → Real Go

The app shows the encoding progression:

**👻 Phantom Go (Step 1)**
- All stones are white (uniform appearance)
- Shows the basic stone placement pattern
- Simple, "phantom-like" look

**✨ Real Go (Step 2)**
- Mixed black and white stones
- Position-based colour variation for natural distribution
- Looks like an actual game in progress

### Decoding

Extracting the key is simple:

1. Identify the 4 quadrants (separated by center row/col 9)
2. For each quadrant, read **ONLY the first 64 positions** (row-by-row)
3. Stone present = `1`, empty = `0`
4. Ignore positions 65-81 (dummy stones)
5. Concatenate: `TL + TR + BL + BR = 256 bits`

**Key insight:** Dummy stones are deterministic but not needed for decoding!

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage Example

1. **Enter your key**: Hex, binary, or plain text
2. **See both boards**: Phantom Go (white) and Real Go (natural colours)
3. **Decode to verify**: Click "Decode Board → Key" to recover original

## Technical Details

### Key Properties

✓ **Deterministic** - Same key always produces the same board  
✓ **Capacity** - Full 256-bit encryption key support  
✓ **Valid Go rules** - All stones have liberties (no captures)  
✓ **Natural appearance** - Dummy stones eliminate obvious patterns  
✓ **Perfect recovery** - Decoding is lossless  

### Go Board Structure

- **Board Size**: 19×19 (361 intersections)
- **Quadrants**: 4 regions of 9×9 (81 positions each)
- **Data positions**: First 64 per quadrant (256 total)
- **Dummy positions**: Last ~17 per quadrant (fill gaps)

### Key Formats Supported

- **Hex**: `deadbeef1234...` (converted to binary)
- **Binary**: `10110101...` (used directly)
- **Text**: Any string (hashed to 256 bits)

## Security Considerations

**What Goban Vault provides:**
- ✅ Steganographic concealment (keys look like games)
- ✅ Plausible deniability (no obvious encrypted data)
- ✅ Physical backup capability (printable boards)

**What it does NOT provide:**
- ❌ Encryption of the key itself (store securely!)
- ❌ Authentication (anyone with the board can decode)
- ❌ Protection against statistical analysis of multiple boards

**Best practices:**
- Combine with actual encryption for sensitive keys
- Use unique keys (avoid reuse)
- Store board images in legitimate game collections
- Print boards for offline backup

## Project Structure

```
goban-vault/
├── src/
│   ├── components/        # React UI components
│   ├── core/             # Encoding/decoding logic
│   │   ├── encoder.ts    # Key → Board transformation
│   │   ├── decoder.ts    # Board → Key recovery
│   │   ├── validator.ts  # Go rules validation
│   │   └── colourAssigner.ts  # Natural colour distribution
│   └── utils/            # Helper functions
└── docs/                 # Additional documentation
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (via @tailwindcss/postcss v4)

## License

MIT

---

**Note:** This is a research project exploring steganographic key storage. Use at your own risk for production systems.

