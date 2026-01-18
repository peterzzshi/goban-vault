import { createSeededRandom } from './rng';

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const result = [...array];
    const random = createSeededRandom(seed);
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
    const allPositions = Array.from({ length: totalPositions }, (_, index) => index);
    const shuffled = shuffleWithSeed(allPositions, seed);
    return shuffled.slice(0, totalBits);
}
