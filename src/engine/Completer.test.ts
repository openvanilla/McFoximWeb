import { InputTableManager } from '../data';
import Completer from './Completer';

describe('Test completer', () => {
  test('Sample test', () => {
    let completer = new Completer(() => InputTableManager.getInstance().currentTable);
    let results = completer.complete('A');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});
