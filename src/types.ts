export type StoneType = 'black' | 'white';
export type CellState = StoneType | null;
export type KeySize = 64 | 128 | 256;
export type BoardSize = 9 | 13 | 19;
export type PaddingMode = 'left' | 'right' | 'none';

export const KEY_SIZE_TO_BOARD_SIZE: Record<KeySize, BoardSize> = {
    64: 9,
    128: 13,
    256: 19,
};

export const BOARD_SIZE_CONFIG: Record<BoardSize, {
    size: BoardSize;
    label: string;
}> = {
    9: { size: 9, label: '9×9' },
    13: { size: 13, label: '13×13' },
    19: { size: 19, label: '19×19' },
};

