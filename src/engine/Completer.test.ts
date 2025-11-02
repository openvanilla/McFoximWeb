import { InputTableManager } from '../data';
import Completer from './Completer';

describe('Test completer', () => {
  test('Sample test', () => {
    let table = InputTableManager.getInstance().currentTable;
    let completer = new Completer(table);
    let results = completer.complete('A');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});
