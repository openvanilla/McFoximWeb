import { InputTable } from '../data';
import Candidate from './Candidate';

export default class Completer {
  onRequestTable: () => InputTable;

  // inputTable: InputTable;

  constructor(onRequestTable: () => InputTable) {
    this.onRequestTable = onRequestTable;
  }

  complete(prefix: string): Candidate[] {
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
      results.push(new Candidate(data[i][0], data[i][1]));
    }

    return results;
  }
}
