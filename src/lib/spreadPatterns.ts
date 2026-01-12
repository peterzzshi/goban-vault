export type SpreadPatternType = 'sequential' | 'distributed' | 'checkerboard' | 'spiral';

export interface SpreadPattern {
    name: string;
    description: string;
    bitToPosition: (bitIndex: number, bitsPerQuadrant?: number) => number;
    positionToBit: (positionIndex: number, bitsPerQuadrant?: number) => number;
}

const DEFAULT_BITS = 64;

const sequential: SpreadPattern = {
    name: 'Sequential',
    description: 'Bits fill quadrant row by row from top-left',
    bitToPosition: (bitIndex: number, _bitsPerQuadrant: number = DEFAULT_BITS) => bitIndex,
    positionToBit: (positionIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) =>
        positionIndex < bitsPerQuadrant ? positionIndex : -1,
};

const distributed: SpreadPattern = {
    name: 'Distributed',
    description: 'Bits spread evenly across the entire quadrant',
    bitToPosition: (bitIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantPositions = getQuadrantPositions(bitsPerQuadrant);
        const stride = quadrantPositions / bitsPerQuadrant;
        return Math.floor(bitIndex * stride);
    },
    positionToBit: (positionIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantPositions = getQuadrantPositions(bitsPerQuadrant);
        const stride = quadrantPositions / bitsPerQuadrant;
        for (let bit = 0; bit < bitsPerQuadrant; bit++) {
            if (Math.floor(bit * stride) === positionIndex) {
                return bit;
            }
        }
        return -1;
    },
};

const checkerboard: SpreadPattern = {
    name: 'Checkerboard',
    description: 'Bits placed in alternating diagonal pattern',
    bitToPosition: (bitIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantSize = getQuadrantSize(bitsPerQuadrant);
        const positions: number[] = [];

        for (let pos = 0; pos < quadrantSize * quadrantSize && positions.length < bitsPerQuadrant; pos++) {
            const row = Math.floor(pos / quadrantSize);
            const col = pos % quadrantSize;
            if ((row + col) % 2 === 0) {
                positions.push(pos);
            }
        }
        for (let pos = 0; pos < quadrantSize * quadrantSize && positions.length < bitsPerQuadrant; pos++) {
            const row = Math.floor(pos / quadrantSize);
            const col = pos % quadrantSize;
            if ((row + col) % 2 === 1) {
                positions.push(pos);
            }
        }

        return positions[bitIndex] ?? bitIndex;
    },
    positionToBit: (positionIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantSize = getQuadrantSize(bitsPerQuadrant);
        const positions: number[] = [];

        for (let pos = 0; pos < quadrantSize * quadrantSize && positions.length < bitsPerQuadrant; pos++) {
            const row = Math.floor(pos / quadrantSize);
            const col = pos % quadrantSize;
            if ((row + col) % 2 === 0) {
                positions.push(pos);
            }
        }
        for (let pos = 0; pos < quadrantSize * quadrantSize && positions.length < bitsPerQuadrant; pos++) {
            const row = Math.floor(pos / quadrantSize);
            const col = pos % quadrantSize;
            if ((row + col) % 2 === 1) {
                positions.push(pos);
            }
        }

        const bitIndex = positions.indexOf(positionIndex);
        return bitIndex >= 0 ? bitIndex : -1;
    },
};

const spiral: SpreadPattern = {
    name: 'Spiral',
    description: 'Bits spiral inward from the edges',
    bitToPosition: (bitIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantSize = getQuadrantSize(bitsPerQuadrant);
        const positions = generateSpiralPositions(quadrantSize);
        return positions[bitIndex] ?? bitIndex;
    },
    positionToBit: (positionIndex: number, bitsPerQuadrant: number = DEFAULT_BITS) => {
        const quadrantSize = getQuadrantSize(bitsPerQuadrant);
        const positions = generateSpiralPositions(quadrantSize);
        const bitIndex = positions.slice(0, bitsPerQuadrant).indexOf(positionIndex);
        return bitIndex >= 0 ? bitIndex : -1;
    },
};

function getQuadrantSize(bitsPerQuadrant: number): number {
    if (bitsPerQuadrant <= 32) return 6;
    return 9;
}

function getQuadrantPositions(bitsPerQuadrant: number): number {
    const size = getQuadrantSize(bitsPerQuadrant);
    return size * size;
}

function generateSpiralPositions(quadrantSize: number): number[] {
    const positions: number[] = [];
    const visited: boolean[][] = Array.from({ length: quadrantSize }, () =>
        Array.from({ length: quadrantSize }, () => false)
    );

    let row = 0, col = 0;
    let direction = 0;
    const dr = [0, 1, 0, -1];
    const dc = [1, 0, -1, 0];
    const totalPositions = quadrantSize * quadrantSize;

    for (let i = 0; i < totalPositions; i++) {
        const pos = row * quadrantSize + col;
        positions.push(pos);

        const visitedRow = visited[row];
        if (visitedRow) {
            visitedRow[col] = true;
        }

        const drDir = dr[direction] ?? 0;
        const dcDir = dc[direction] ?? 0;
        const nextRow = row + drDir;
        const nextCol = col + dcDir;

        const nextVisitedRow = visited[nextRow];
        if (
            nextRow >= 0 && nextRow < quadrantSize &&
            nextCol >= 0 && nextCol < quadrantSize &&
            nextVisitedRow && !nextVisitedRow[nextCol]
        ) {
            row = nextRow;
            col = nextCol;
        } else {
            direction = (direction + 1) % 4;
            row = row + (dr[direction] ?? 0);
            col = col + (dc[direction] ?? 0);
        }
    }

    return positions;
}

export const spreadPatterns: Record<SpreadPatternType, SpreadPattern> = {
    sequential,
    distributed,
    checkerboard,
    spiral,
};

export const defaultPattern: SpreadPatternType = 'sequential';
