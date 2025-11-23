// Emoji sets for logic puzzles organized by category
import { EmojiSet } from '../types/LogicTypes';

export const EMOJI_SETS: { [category: string]: EmojiSet[] } = {
    food: [
        { category: 'food', emoji: '🍎', displayName: 'æble' },
        { category: 'food', emoji: '🍐', displayName: 'pære' },
        { category: 'food', emoji: '🍌', displayName: 'banan' },
        { category: 'food', emoji: '🍇', displayName: 'drue' },
        { category: 'food', emoji: '🍓', displayName: 'jordbær' }
    ],
    animals: [
        { category: 'animals', emoji: '🐶', displayName: 'hund' },
        { category: 'animals', emoji: '🐱', displayName: 'kat' },
        { category: 'animals', emoji: '🐸', displayName: 'frø' },
        { category: 'animals', emoji: '🐵', displayName: 'abe' },
        { category: 'animals', emoji: '🐼', displayName: 'panda' }
    ],
    shapes: [
        { category: 'shapes', emoji: '⭐', displayName: 'stjerne' },
        { category: 'shapes', emoji: '❤️', displayName: 'hjerte' },
        { category: 'shapes', emoji: '🔵', displayName: 'blå cirkel' },
        { category: 'shapes', emoji: '⬜', displayName: 'firkant' },
        { category: 'shapes', emoji: '🔷', displayName: 'diamant' }
    ]
};

// Get all emoji sets as a flat array
export function getAllEmojiSets(): EmojiSet[] {
    return Object.values(EMOJI_SETS).flat();
}

// Get random emoji set from a specific category
export function getRandomEmojiSetFromCategory(category: string): EmojiSet | undefined {
    const sets = EMOJI_SETS[category];
    if (!sets || sets.length === 0) return undefined;
    return sets[Math.floor(Math.random() * sets.length)];
}

// Get random emoji set from any category
export function getRandomEmojiSet(): EmojiSet {
    const allSets = getAllEmojiSets();
    return allSets[Math.floor(Math.random() * allSets.length)];
}

// Format emoji for display (with grouping notation for 7+)
export function formatEmojiDisplay(emoji: string, count: number): string {
    if (count >= 7) {
        return `${emoji}×${count}`;
    }
    return emoji.repeat(count);
}
