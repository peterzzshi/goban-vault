# Goban Vault

**Hide your private keys in plain sight.** Encodes cryptographic keys as Go board positions that look like ordinary game records.

🚀 **Live:** https://peterzzshi.github.io/goban-vault/

## Why?

Digital storage (cloud, password managers) creates honeypots. Physical backups (paper, metal) look valuable. A printed Go board reads as a game record, not key material.

**Use cases:**
- Print/screenshot keys as game records for physical backup
- Store in photo albums, notebooks, or public repos without attracting attention
- Split the secret: share the board publicly, keep seed + edits private
- Cross-border travel with keys that don't look like keys

**Supported:** Bitcoin, Ethereum, Solana (256-bit), plus 128-bit and 64-bit keys. Enter a key as hex or as a BIP39 mnemonic phrase — board size (9×9 / 13×13 / 19×19) scales with key size.

## Security Model

**Two secrets protect your key:**

1. **Seed (memorize):** A number that drives the PRNG mapping key bits → board positions. Same seed + key = same board. Lossless: with the right seed, decode recovers the exact key.
2. **Manual edits (owner knowledge):** Click to add/remove stones after encoding, following Go rules (captures included). These edits change what the board decodes to. You memorize the edits so you can reverse them during recovery.

**Recovery:** Rebuild the board, reverse your edits (restore any captured stones), then read the decoded key.

**Plausible deniability:** Without your edits, the board decodes to a *different but valid* key. For never-used cold storage, an attacker can't tell which is real. Note: the seed PRNG isn't cryptographic — the memorized edits carry the real secret.

## How to Use

### Encoding
1. Select the key size (64/128/256-bit)
2. Enter your private key (hex) or mnemonic phrase, or click **Generate Random**
3. Enter a memorable seed (e.g., birth year)
4. Board generates automatically
5. **Optional:** Click 3–5 positions to add/remove stones (memorize these)
6. Screenshot or print

### Recovery
1. Enter your seed
2. Rebuild the board, reverse your edits (click the same positions, restore captured stones)
3. Original key or mnemonic appears

## Running Locally

```bash
bun install && bun run dev
```

Run tests: `bun run test`

## ⚠️ Important

- **Test recovery first.** Verify you can decode before relying on this.
- **Memorize seed + edits.** Without them, the board is just a random game.
- **Not a substitute for hardware wallets.** Best for long-term cold storage or estate planning.

## License

MIT — Use at your own risk.
