export function createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;
    if (state === 0) {
        state = 1;
    }

    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}
