import { InputTable } from '../data';

export default class Completer {
  inputTable: InputTable;

  constructor(inputTable: InputTable) {
    this.inputTable = inputTable;
  }

  complete(prefix: string): string[] {
    // Binary search for the first matching entry
    const data = this.inputTable.data;
    let left = 0;
    let right = data.length - 1;
    let firstMatch = -1;

    // Find the first entry that starts with the prefix
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (data[mid] < prefix) {
        left = mid + 1;
      } else if (data[mid].startsWith(prefix)) {
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
    const results: string[] = [];
    for (let i = firstMatch; i < data.length && data[i].startsWith(prefix); i++) {
      results.push(data[i]);
    }

    return results;
  }
}
