import { InputTable } from '../data';
import Candidate from './Candidate';

/**
 * Performs prefix lookup against the current input table.
 *
 * The completer reads the active table on demand, finds matching rows by
 * prefix, merges duplicate surface forms, and returns candidates sorted by
 * display-text length.
 */
export default class Completer {
  /**
   * Creates a completer that reads the current input table on demand.
   * @param onRequestTable Callback that returns the active input table.
   */
  constructor(readonly onRequestTable: () => InputTable) {}

  private complete_(prefix: string): Candidate[] {
    if (prefix.length === 0) {
      return [];
    }
    // Binary search for the first matching entry
    const data = this.onRequestTable().data;
    let left = 0;
    let right = data.length - 1;
    let firstMatch = -1;

    // Find the first entry that starts with the prefix
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (data[mid][0] < prefix) {
        left = mid + 1;
      } else if (data[mid][0].startsWith(prefix)) {
        firstMatch = mid;
        right = mid - 1; // Continue searching left for the first match
      } else {
        right = mid - 1;
      }
    }

    if (firstMatch === -1) {
      return [];
    }

    // Collect all consecutive matches
    const results: Candidate[] = [];
    for (let i = firstMatch; i < data.length && data[i][0].startsWith(prefix); i++) {
      var duplicateFound = false;
      for (let result of results) {
        if (result.displayText.toLowerCase() === data[i][0].toLowerCase()) {
          result.description += '/' + data[i][1];
          duplicateFound = true;
          break;
        }
      }
      if (duplicateFound) {
        continue;
      }

      results.push(new Candidate(data[i][0], data[i][1]));
    }

    return results;
  }

  /**
   * Looks up candidates for a composing prefix.
   *
   * If the prefix begins with an uppercase letter, both the original prefix and
   * its lowercased form are searched so the returned display text can preserve
   * initial capitalization.
   * @param prefix The composing prefix to search for.
   * @returns Matching candidates sorted by display-text length.
   */
  complete(prefix: string): Candidate[] {
    if (prefix.length === 0) {
      return [];
    }

    if (prefix.length > 0 && prefix[0] === prefix[0].toUpperCase()) {
      const original = this.complete_(prefix);
      const lowered = this.complete_(prefix.toLowerCase());
      const mapInitialUppercase = (candidates: Candidate[]) =>
        candidates.map(
          (c) =>
            new Candidate(
              c.displayText.charAt(0).toUpperCase() + c.displayText.slice(1),
              c.description,
            ),
        );
      const combined: Candidate[] = [...original, ...mapInitialUppercase(lowered)];
      const sorted = Array.from(combined).sort(
        (a, b) => a.displayText.length - b.displayText.length,
      );
      return sorted;
    }
    const result = this.complete_(prefix);
    const sorted = Array.from(result).sort((a, b) => a.displayText.length - b.displayText.length);
    return sorted;
  }
}
