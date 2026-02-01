/**
 * Normalises career matching scores to a 0-100% scale.
 *
 * Score ranges:
 * - Worst match: < -8 (normalised to 0%)
 * - Poor to good: -8 to 2.5 (normalised to 0% to 80%)
 * - Good to excellent: 2.5 to 4 (normalised to 80% to 100%)
 * - Better than 4: rare cases (capped at 100%)
 *
 * This piecewise approach honors domain knowledge where:
 * - 2.5–3 range = good matches
 * - 3–4 range = really good matches
 *
 * @param score - Raw matching score from backend (-10.4 to 17)
 * @returns Normalised percentage (0-100)
 */
export function normaliseRankingScore(score: number): number {
    let percentage: number;
    
    if (score < -8) {
        percentage = 0;
    } else if (score < 2.5) {
        // Poor to good: -8 to 2.5 → 0% to 80%
        percentage = ((score + 8) / 10.5) * 80;
    } else if (score < 4) {
        // Good to excellent: 2.5 to 4 → 80% to 100%
        percentage = 80 + ((score - 2.5) / 1.5) * 20;
    } else {
        // Better than 4 (rare cases)
        percentage = 100;
    }

    return Math.floor(percentage);
}

/**
 * Gets a match quality label for a normalised score.
 *
 * @param score - Normalised percentage (0-100)
 * @returns Human-readable quality label
 */
export function getMatchQualityLabel(score: number): string {
    if (score < 20) {
        return "Poor match";
    } else if (score < 40) {
        return "Fair match";
    } else if (score < 60) {
        return "Good match";
    } else if (score < 80) {
        return "Very good match";
    } else {
        return "Excellent match";
    }
}