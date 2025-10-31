export function fisherYatesShuffle<T>(array: T[]): T[] {
    let shuffled: T[] = [...array];
    for (let i: number = shuffled.length - 1; i > 0; i--) {
        let j: number = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}