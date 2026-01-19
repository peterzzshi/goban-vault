# Goban Vault

Encode cryptographic keys as natural-looking Go board positions. Keys hide in plain sight as believable game states.

- **Live app** 🚀 https://peterzzshi.github.io/goban-vault/
- **What it does** ♟️ convert a hex key into stones on a Go board and back again, with captures and liberties applied automatically.
- **Who it's for** 🧠 Anyone who wants a memorable, printable, or deniable way to store keys — or just a clean Go game board.

## Use Cases

- 🧾 **Plausible backup**: A printed or screenshotted board can hold your key without looking like a key.
- 📜 **Paper/archive storage**: Keep a physical copy that survives digital loss.
- 🧩 **Visual memory aid**: Remember a pattern instead of a hex string.
- ⚫ **Go board sandbox**: Edit positions, explore shapes, and see captures auto-apply.

## Features

- ⛓️ Encode/decode 64/128/256-bit hex keys directly on the board.
- 🟨 Dynamic board sizes (9×9, 13×13, 19×19) with seeded layouts for realistic positions.
- 🔁 Real-time two-way sync: typing updates the board; placing/removing stones updates the key.
- ⚖️ Automatic Go rules: captures remove stones; suicide moves are blocked.
- 🎨 Mixed black/white stones for a natural look; manual stone colours stay as placed.
- 🧵 Short keys are padded automatically so encoding/decoding stay reliable.

> **How it works** 🧮
> 1. Paste or type a hex key. The app pads it (if needed) so every bit maps cleanly.
> 2. Bits are read with the current seed to decide stone order, coordinates, and colour mix.
> 3. The board renders those stones, applies Go liberties, and updates the key in real time.
> 4. Manual edits immediately re-encode into the input box, so the board and key always match.

## Quick Start

```bash
npm install
npm run dev
```
Open the local URL shown in the terminal.

## How to Use

1. Enter or paste your hex key in the input box (choose 64/128/256 bits).
2. Pick a board size and seed. The seed controls the reading order and stone colours.
3. Adjust padding direction if you use shorter keys; padding is applied automatically.
4. Click the board to add/remove stones. Captures resolve immediately. The key field updates in real time.
5. Save the board (screenshot/print/export) along with your seed and any manual edits.

## Tips for Safe Use

- 🔒 Memorise your seed and any manual tweaks; you need both to recover the exact key.
- 🎭 Make the board look like a believable mid-game to avoid suspicion.
- 🧪 Test recovery before relying on a board as your only backup.

## Licence

MIT

---

*Experimental tool. Use at your own discretion for key storage.*
