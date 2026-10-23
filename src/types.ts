export type StoneType = 'black' | 'white';
export type CellState = StoneType | null;
export type KeySize = 64 | 128 | 256;
export type BoardSize = 9 | 13 | 19;

export interface PlacedStone {
    row: number;
    col: number;
    colour: StoneType;
}

export const KEY_SIZE_TO_BOARD_SIZE: Record<KeySize, BoardSize> = {
    64: 9,
    128: 13,
    256: 19,
};

export const BOARD_SIZE_CONFIG: Record<BoardSize, {
    size: BoardSize;
    label: string;
}> = {
    9: { size: 9, label: '9\u00d79' },
    13: { size: 13, label: '13\u00d713' },
    19: { size: 19, label: '19\u00d719' },
};

export interface KeyChainConfig {
    size: KeySize;
    hexChars: number;
    label: string;
    chains: string;
}

export const KEY_CHAIN_CONFIGS: KeyChainConfig[] = [
    { size: 64, hexChars: 16, label: '64-bit', chains: 'Short keys, demo' },
    { size: 128, hexChars: 32, label: '128-bit', chains: 'Lightweight keys' },
    { size: 256, hexChars: 64, label: '256-bit', chains: 'Bitcoin, Ethereum, Solana' },
];

