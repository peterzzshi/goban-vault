# Goban Vault

**Hide your private keys in plain sight.** This tool encodes cryptographic keys as Go board positions that look like ordinary game records.

🚀 **Live app:** https://peterzzshi.github.io/goban-vault/

## Why?

**The problem:** Storing private keys digitally (cloud, password managers, encrypted files) creates honeypots. Physical backups (paper, metal plates) are obviously valuable if discovered.

**The solution:** A printed Go board reads as a game record rather than key material. Only you know the seed and the manual edits needed to recover the key, so the board alone decodes to a different, plausible key.

**Use cases:**
- Print/screenshot your key as a game record for physical backup
- Store it in photo albums, notebooks, or public repositories without attracting attention
- Split the secret: share the board publicly, keep the seed + mutations private
- Cross-border travel with keys that don't look like keys

## Security Model: Seed + Mutations

**Two independent secrets protect your key:**

1. **Seed (memorise this):** Drives the PRNG that maps each key bit to a board intersection. Same seed + key = same board. Encoding is lossless: with the right seed, the base board decodes back to the exact key.
2. **Manual edits (owner knowledge):** After encoding, you click to add/remove stones, playing under normal Go rules (captures included). These edits change the key the board decodes to. You memorise the edits — and, for any capturing move, the stones it removed — so you can reverse them during recovery.

**Recovery:** Rebuild the board, reverse your memorised edits (restoring any captured stones), then read the decoded key.

**Plausible deniability:** Without your edits, the board decodes to a *different but valid-looking* key. For a never-used cold-storage key an attacker cannot tell which decoding is real. Note this is deniability, not a proof of cryptographic hardness: the seed PRNG is not cryptographic, so do not treat the seed alone as strong protection — the memorised edits are what carry the real secret.

## How to Use

### Encoding a Key
1. Paste your private key (hex format) into the input field
2. Choose a memorable seed number (e.g., your birth year or PIN)
3. The board generates automatically
4. **Optional:** Click 3-5 positions to add/remove stones (memorise these mutations)
5. Screenshot or print the board

### Recovering a Key
1. Open the app and enter your seed
2. Rebuild the memorised board, then reverse your edits by clicking the same positions (and restoring any stones those moves captured)
3. Your original key appears in the input field

### Example Workflow
- Generate a Bitcoin private key → encode with seed `1234` → edit stones at `(3,7)`, `(9,2)`, `(15,15)` → print the board
- To recover: enter seed `1234` → rebuild the printed board → reverse the edits at `(3,7)`, `(9,2)`, `(15,15)` → original key restored

## Running Locally

```bash
npm install && npm run dev
```

Run the encode/decode round-trip tests with `npm test`.

## ⚠️ Important

- **Test recovery first.** Never rely on this as your only backup without verifying you can decode it.
- **Memorize your seed + mutations.** Without them, the board is just a random game.
- **Not a substitute for hardware wallets** for active funds. Best for long-term cold storage or estate planning.

## License

MIT — Use at your own risk.
