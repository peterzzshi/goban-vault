# Goban Vault

**Hide your private keys in plain sight.** This tool encodes cryptographic keys as Go board positions that look like ordinary game records.

🚀 **Live app:** https://peterzzshi.github.io/goban-vault/

## Why?

**The problem:** Storing private keys digitally (cloud, password managers, encrypted files) creates honeypots. Physical backups (paper, metal plates) are obviously valuable if discovered.

**The solution:** A printed Go board looks like a game record. Only you know the seed and manual edits needed to recover the key. No one can distinguish it from a casual game screenshot.

**Use cases:**
- Print/screenshot your key as a game record for physical backup
- Store it in photo albums, notebooks, or public repositories without attracting attention
- Split the secret: share the board publicly, keep the seed + mutations private
- Cross-border travel with keys that don't look like keys

## Security Model: Seed + Mutations

**Two-factor recovery protects your key:**

1. **Seed (memorise this):** Generates the base board from your key deterministically. Same seed + key = same board.
2. **Manual mutations (owner knowledge):** After encoding, you click to add/remove stones. These changes update the displayed key but are invisible to anyone else. Memorising 3-5 mutations makes brute-force attacks infeasible.

**Recovery:** Enter your seed, place your memorised mutations → original key appears.

**Plausible deniability:** Without knowing your mutations, the board decodes to a different (plausible but wrong) key. An attacker can't prove your actual key exists.

## How to Use

### Encoding a Key
1. Paste your private key (hex format) into the input field
2. Choose a memorable seed number (e.g., your birth year or PIN)
3. The board generates automatically
4. **Optional:** Click 3-5 positions to add/remove stones (memorise these mutations)
5. Screenshot or print the board

### Recovering a Key
1. Open the app and enter your seed
2. Recreate your memorised mutations by clicking the same positions
3. Your original key appears in the input field

### Example Workflow
- Generate a Bitcoin private key → encode with seed `1234` → add stones at `(3,7)`, `(9,2)`, `(15,15)` → print the board
- To recover: enter seed `1234` → click `(3,7)`, `(9,2)`, `(15,15)` → original key restored

## Running Locally

```bash
npm install && npm run dev
```

## ⚠️ Important

- **Test recovery first.** Never rely on this as your only backup without verifying you can decode it.
- **Memorize your seed + mutations.** Without them, the board is just a random game.
- **Not a substitute for hardware wallets** for active funds. Best for long-term cold storage or estate planning.

## License

MIT — Use at your own risk.
