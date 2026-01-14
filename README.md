# Goban Vault

Encode cryptographic keys as valid Go board positions. Keys hide in plain sight as natural-looking game states.

## Why?

Traditional key storage (files, password managers) are obvious targets. Goban Vault provides **steganographic security** — your key looks like an ordinary Go game.

- 🎭 **Plausible deniability** — observers see a game, not encrypted data
- 📄 **Physical backup** — print boards on paper (survives digital threats)
- 🧠 **Visual memory** — patterns are easier to recall than hex strings
- 🎮 **Or just play** — use it as a simple Go board editor

## Features

- Encode 64/128/256-bit keys as Go board positions
- Dynamic board sizes: 9×9, 13×13, 19×19
- Seeded position randomisation for unique layouts
- Real-time bidirectional sync between key input and board
- Full Go rules: captures applied automatically, suicide moves prevented
- Mixed black/white stones for natural appearance
- Configurable padding (left or right) for partial keys

## Quick Start

```bash
npm install
npm run dev
```

## How to Use

### As a Key Backup Tool

1. **Enter your key** in the hex input field (updates board in real-time)
2. **Select key size** (64, 128, or 256 bits)
3. **Choose padding direction** (left or right — affects how short keys are interpreted)
4. **Set a seed number** (affects stone distribution — memorise this)
5. **Optionally add/remove stones** to obscure the pattern — the key updates automatically
6. **Save the board** (screenshot, print, or remember)

To recover: recreate the exact board position with the same seed → the key appears in the input field.

> ⚠️ **Your responsibility**: Remember your seed number and any stone modifications. There's no recovery without these.

### As a Go Board Editor

Click intersections to place stones (in the selected colour). Click existing stones to remove them. Captured groups are removed automatically following Go rules.

## Encoding

### Board Sizes

| Key Size | Board | Total Positions | Used |
|----------|-------|-----------------|------|
| 64 bits  | 9×9   | 81              | 64   |
| 128 bits | 13×13 | 169             | 128  |
| 256 bits | 19×19 | 361             | 256  |

### Binary Mapping

```
Stone present = 1
Empty position = 0
```

Positions are read in a seeded order, producing a binary string that converts to hex.

### Position Generation

Positions are mapped using a **seeded shuffle**:

1. Divide board into even `(row + col) % 2 = 0` and odd positions
2. Shuffle each group using the seed
3. Combine to get the final position order

Same seed → same layout. Different seeds → completely different boards.

### Stone Colours

Colours are deterministic but appear random:
```
colour = seededRandom(seed + bitIndex) < threshold ? black : white
```

This creates natural-looking distributions while remaining reproducible.

### Capture Rules

After any board change, groups with zero liberties are removed. The board always shows a valid Go position.

## Security

### What This Provides

Goban Vault offers **obfuscation**, not encryption. Security relies on:

- Attacker not knowing your seed
- Uncertainty about manual stone modifications
- The board appearing as an ordinary game

### Brute Force Resistance

| Security Layer          | Combinations |
|-------------------------|--------------|
| Seed alone (31-bit)     | ~2 billion   |
| + 20 modified positions | ~10^15       |
| + 30 modified positions | ~10^18       |

**Recommendation**: Use a memorable seed and modify 20-30 positions.

### Best Practices

1. Modify positions you can remember
2. Make the board look like a realistic mid-game
3. Test recovery before relying on it
4. Use as one layer of defence, not your only protection

## Project Structure

```
src/
├── components/
│   ├── Board.tsx            # Go board UI
│   ├── BoardControls.tsx    # Seed, colour, and actions
│   └── PrivateKeyInput.tsx  # Key input and config
├── core/
│   ├── encoder.ts           # Key ↔ board conversion
│   ├── goRules.ts           # Liberty checking, captures
│   └── positionGenerator.ts # Seeded position mapping
├── store.ts                 # Zustand state
└── types.ts                 # Type definitions
```

## Tech Stack

React 19 · TypeScript · Vite · Zustand · Tailwind CSS

## Licence

MIT

---

*Experimental tool. Use at your own discretion for key storage.*
