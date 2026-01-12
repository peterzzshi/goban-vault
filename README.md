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
- Two spread patterns for natural stone distribution
- Real-time two-way sync between key and board
- Full Go rules: captures are applied, no suicide moves
- Mixed black/white stones for natural appearance

## Quick Start

```bash
npm install
npm run dev
```

## How to Use

### As a Key Backup Tool

1. **Enter your key** in the hex input field
2. **Select key size** (64, 128, or 256 bits)
3. **Choose a spread pattern** (affects stone distribution)
4. **Optionally add stones** to obscure the pattern — these change the decoded key
5. **Save the board** (screenshot, print, or remember)

To recover: recreate the exact board position → the key appears in the input field.

> ⚠️ **Your responsibility**: Remember which stones are "noise" and the spread pattern used. There's no recovery without the exact board state.

### As a Go Board Editor

Simply click to place/remove stones. The app enforces Go rules — captured groups are removed automatically.

## Encoding Explained

### Board Structure

| Key Size | Board | Positions      |
|----------|-------|----------------|
| 64 bits  | 9×9   | 81 (64 used)   |
| 128 bits | 13×13 | 169 (128 used) |
| 256 bits | 19×19 | 361 (256 used) |

### Encoding Rule

```
Stone present = 1
Empty position = 0
```

The board is read position-by-position according to the spread pattern, producing a binary string that converts to hex.

### Spread Patterns

**Distributed** — Bits spread evenly across the board
```
Position = floor(bit × (total_positions / total_bits))
```

**Checkerboard** — Alternating diagonal pattern (even squares first, then odd)
```
First pass: positions where (row + col) % 2 = 0
Second pass: positions where (row + col) % 2 = 1
```

Both patterns distribute stones naturally across the entire board, producing realistic-looking game states.

### Colour Assignment

Stone colours are randomised using a seed derived from the key itself:
```
seed = hash(key) + bitIndex
colour = seededRandom(seed) < threshold ? black : white
```

This produces a unique, natural-looking colour distribution for each key while maintaining reproducibility — the same key always generates the same board.

### Capture Simulation

After encoding, `applyCaptures()` removes any groups with zero liberties. This ensures the board always shows a valid Go position.

## Security Considerations

### What This Is (and Isn't)

Goban Vault provides **obfuscation**, not encryption. Security comes from:
- Attacker not knowing which stones are "noise" (added or removed)
- Uncertainty about which spread pattern was used
- The board looking like an ordinary game

### Entropy Analysis

**Effective positions** (19×19 board): **361 positions**

**Go rules constraint**: Not all configurations are valid — stones must have liberties. This reduces the theoretical state space, though valid Go positions still number approximately **10^170**.

### Brute Force Resistance

Without modifications, an attacker needs only **6 attempts** (2 patterns × 3 key sizes).

With **P** modified positions, the attacker must try up to **2^P × 6** combinations:

| Modified Positions | Attempts       | Time @ 1M/sec |
|--------------------|----------------|---------------|
| 10                 | 6,000          | instant       |
| 20                 | 6 million      | 6 seconds     |
| 30                 | 6 billion      | 1.5 hours     |
| 40                 | 6 trillion     | 70 days       |

### Practical Reality

**Can you remember 40+ modifications?** Yes — if you think in patterns, not individual stones.

Professional Go players routinely memorise entire board positions. Variants like **Phantom Go** and **Blindfold Go** require players to track hidden stones throughout the game — the exact skill this tool leverages.

**Realistic assessment**: A player comfortable with these variants can remember complex board states, easily achieving **40-60 modifications** for strong brute-force resistance.

### Limitations

- **Not cryptographic** — obfuscation, not encryption
- **Go rules reduce randomness** — some positions are invalid
- **Human memory limits** — practical security is lower than theoretical
- **Pattern analysis** — statistical methods might detect encoded regions

### Best Practices

1. Modify positions you can actually remember
2. Make the final position look like a realistic mid-game
3. Test recovery multiple times before relying on it
4. Consider this one layer of defence, not your only protection

## Project Structure

```
src/
├── components/     # React UI
├── lib/
│   ├── encoder.ts      # Key ↔ Board conversion
│   ├── goRules.ts      # Liberty checking, captures
│   └── spreadPatterns.ts  # Pattern algorithms
└── stores/
    └── gameStore.ts    # Zustand state
```

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS · Zustand

## License

MIT

---

*This is an experimental tool. Use at your own discretion for key storage.*
