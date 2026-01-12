export type SpreadPatternType = 'distributed' | 'checkerboard';

export interface SpreadPattern {
    name: string;
    description: string;
    generatePositions: (totalBits: number, totalPositions: number) => number[];
}

const distributed: SpreadPattern = {
    name: 'Distributed',
    description: 'Bits spread evenly across the entire board',
    generatePositions: (totalBits: number, totalPositions: number): number[] => {
        const stride = totalPositions / totalBits;
        const positions: number[] = [];

        for (let bit = 0; bit < totalBits; bit++) {
            positions.push(Math.floor(bit * stride));
        }

        return positions;
    },
};

const checkerboard: SpreadPattern = {
    name: 'Checkerboard',
    description: 'Bits placed in alternating diagonal pattern',
    generatePositions: (totalBits: number, totalPositions: number): number[] => {
        const boardSize = Math.sqrt(totalPositions);
        const positions: number[] = [];

        for (let pos = 0; pos < totalPositions && positions.length < totalBits; pos++) {
            const row = Math.floor(pos / boardSize);
            const col = pos % boardSize;
            if ((row + col) % 2 === 0) {
                positions.push(pos);
            }
        }
        for (let pos = 0; pos < totalPositions && positions.length < totalBits; pos++) {
            const row = Math.floor(pos / boardSize);
            const col = pos % boardSize;
            if ((row + col) % 2 === 1) {
                positions.push(pos);
            }
        }

        return positions.slice(0, totalBits);
    },
};

export const spreadPatterns: Record<SpreadPatternType, SpreadPattern> = {
    distributed,
    checkerboard,
};

