function seededRandom(seed: number): () => number {
    let state = seed || 1;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const result = [...array];
    const random = seededRandom(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = result[i];
        const swap = result[j];
        if (temp !== undefined && swap !== undefined) {
            result[i] = swap;
            result[j] = temp;
        }
    }
    return result;
}

export function generatePositions(totalBits: number, totalPositions: number, seed: number): number[] {
    const boardSize = Math.sqrt(totalPositions);
    const evenPositions: number[] = [];
    const oddPositions: number[] = [];

    for (let pos = 0; pos < totalPositions; pos++) {
        const row = Math.floor(pos / boardSize);
        const col = pos % boardSize;
        if ((row + col) % 2 === 0) {
            evenPositions.push(pos);
        } else {
            oddPositions.push(pos);
        }
    }

    const shuffledEven = shuffleWithSeed(evenPositions, seed);
    const shuffledOdd = shuffleWithSeed(oddPositions, seed + 1);

    const combined = [...shuffledEven, ...shuffledOdd];
    return combined.slice(0, totalBits);
}
