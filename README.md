# Goban Vault

A cryptographic key encoder/decoder using Go (Baduk/Weiqi) board positions. This application encodes encryption keys as valid Go game positions on a 19×19 board, providing a unique steganographic approach to key storage.

## Features

- 🔐 Encode 256-bit keys as valid Go board positions
- 🎲 Natural stone placement with dummy stones for authenticity
- ✅ Validation of Go game rules (no captured groups)
- 🔄 Decode keys from board positions
- 🎨 Visual board representation with realistic stone rendering
- 🌈 Support for both fixed and mixed color encoding modes

## Tech Stack

- React 19 + TypeScript
- Vite for build tooling
- Lucide React for icons
- Tailwind CSS for styling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

### Encoding Process

The encoding process transforms a 256-bit key into a natural-looking Go board position:

1. **Key Input**: Enter your key in hex, binary, or plain text format
2. **Quadrant Division**: The 19×19 board is divided into 4 quadrants by the center lines (row/col 9)
3. **Data Placement**: Each quadrant encodes 64 bits in its first 64 positions (reading row-by-row, left-to-right)
4. **Dummy Stone Filling**: Remaining ~17 positions per quadrant are filled with deterministic pseudo-random "dummy" stones
5. **Validation**: All stone placements are validated to ensure they follow Go rules (no captured groups)

### Natural Filling Strategy

**Why Dummy Stones?**
- Each quadrant has 81 positions (9×9) but only needs 64 for data
- The remaining 17 positions would create obvious empty patterns
- Dummy stones fill these gaps to make the board look like a real game

**How Dummy Stones Work:**
- **Deterministic**: Based on key hash, so same key → same dummy pattern
- **Pseudo-random**: Placement uses hash-based calculations (~40% density)
- **Rule-compliant**: All dummy stones respect Go rules (maintain liberties)
- **Ignorable**: Decoder reads only first 64 positions per quadrant

### Decoding Algorithm

Extracting the original key is simple and elegant:

1. Identify the 4 quadrants (separated by center row/col 9)
2. For each quadrant, read **ONLY the first 64 positions**
3. Read order: row-by-row, left-to-right within each quadrant
4. Ignore all stones beyond position 64 (dummy stones)
5. Stone present = `1`, empty = `0` (color is irrelevant!)
6. Concatenate: `TL(64) + TR(64) + BL(64) + BR(64) = 256 bits`

**💡 Key Insight:** Dummy stones are reproducible but not needed for decoding—they just make the board look natural!

### Encoding Modes

**Fixed Colors Mode:**
- Data stones: Predetermined color assignment
- Creates consistent, predictable patterns
- Simpler encoding logic

**Mixed Colors Mode:**
- Data stones: Hash-based color variation
- Creates more organic, natural-looking distributions
- Better visual authenticity

### Perfect Natural Encoding Achievements

✓ **Deterministic encoding** - Same key always produces the same board  
✓ **256-bit capacity** - 64 bits per quadrant × 4 quadrants  
✓ **Valid Go rules** - All stones have liberties, no captures  
✓ **Natural appearance** - No obvious empty patterns or structures  
✓ **Even distribution** - Dummy stones fill gaps throughout the board  
✓ **Mixed colors** - Organic color distribution (when enabled)  
✓ **Perfect decoding** - Ignore dummy stones, read only data positions  
✓ **Memorable structure** - Quadrant-based system is easy to understand  

## Project Structure

```
goban-vault/
├── README.md
├── LICENSE
├── package.json
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GoBoard.tsx          # Board visualization
│   │   ├── KeyInput.tsx         # Key input component
│   │   ├── EncodingControls.tsx # Encoding mode selection
│   │   ├── BoardStats.tsx       # Board statistics display
│   │   ├── DecodingPanel.tsx    # Decoding interface
│   │   └── GobanVaultApp.tsx    # Main app component
│   ├── core/
│   │   ├── encoder.ts           # Core encoding logic
│   │   ├── decoder.ts           # Core decoding logic
│   │   ├── validator.ts         # Go rules validation
│   │   ├── colorAssigner.ts     # Colour assignment algorithms
│   │   └── types.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── keyConverter.ts      # Hex/binary/text conversion
│   │   └── constants.ts         # Board size, patterns, etc.
│   ├── App.tsx                  # App entry component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles
├── docs/                        # Additional documentation
└── ...config files
```

## Technical Details

### Go Board Basics
- **Board Size**: 19×19 (361 intersections)
- **Center Point**: Row/Col 9 (0-indexed)
- **Quadrants**: 4 equal regions of 9×9 (81 positions each)
- **Stone Colours**: Black (`1`) and White (`2`)

### Key Conversion
- **Hex Input**: Converted to binary (4 bits per character)
- **Binary Input**: Used directly
- **Text Input**: Hashed using DJB2-style hash to generate binary

### Validation
- **Liberty Check**: Each stone must have at least one adjacent empty intersection
- **No Captures**: Board must not contain any surrounded groups
- **Color Count**: Tracks black and white stone distribution

## License

MIT
