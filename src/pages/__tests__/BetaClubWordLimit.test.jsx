import { describe, it, expect } from 'vitest';

describe('BetaClub List Your Venture - Description Word Count & Limiter', () => {
    const getWordCount = (text = '') => {
        const trimmed = text.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    };

    const handleDescriptionChangeSim = (currentText, newText) => {
        const words = newText.trim() ? newText.trim().split(/\s+/) : [];
        if (words.length <= 300) {
            return newText;
        } else {
            return words.slice(0, 300).join(' ');
        }
    };

    it('returns 0 for empty or whitespace-only text', () => {
        expect(getWordCount('')).toBe(0);
        expect(getWordCount('   ')).toBe(0);
        expect(getWordCount(undefined)).toBe(0);
    });

    it('counts words accurately across multiple spaces and newlines', () => {
        const text = 'Innovative   AI platform\nfor SME retail  businesses.';
        expect(getWordCount(text)).toBe(7);
    });

    it('allows input within 300 words limit', () => {
        const words = Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ');
        const result = handleDescriptionChangeSim('', words);
        expect(getWordCount(result)).toBe(150);
        expect(result).toBe(words);
    });

    it('strictly trims words exceeding 300 words to exactly 300 words', () => {
        const words = Array.from({ length: 350 }, (_, i) => `token${i}`).join(' ');
        const result = handleDescriptionChangeSim('', words);
        expect(getWordCount(result)).toBe(300);
        const resultWords = result.split(/\s+/);
        expect(resultWords.length).toBe(300);
        expect(resultWords[0]).toBe('token0');
        expect(resultWords[299]).toBe('token299');
    });
});
