import { InputTable } from '../data';
import Completer from './Completer';

describe('Completer', () => {
  const createCompleter = (data: string[][]) =>
    new Completer(() => ({
      name: 'test',
      data,
    }));

  test('returns an empty list for an empty prefix', () => {
    const completer = createCompleter([['abc', 'gloss']]);

    expect(completer.complete('')).toEqual([]);
  });

  test('returns an empty list when there is no prefix match', () => {
    const completer = createCompleter([
      ['ab', 'short'],
      ['abc', 'gloss'],
      ['abd', 'sibling'],
    ]);

    expect(completer.complete('zzz')).toEqual([]);
  });

  test('returns prefix matches sorted by display text length', () => {
    const completer = createCompleter([
      ['a', 'letter a'],
      ['ab', 'short'],
      ['aba', 'longer'],
      ['abc', 'gloss'],
      ['abd', 'sibling'],
      ['b', 'letter b'],
    ]);
    const results = completer.complete('ab');

    expect(results.map((candidate) => candidate.displayText)).toEqual(['ab', 'aba', 'abc', 'abd']);
  });

  test('merges duplicate candidates with the same display text ignoring case', () => {
    const completer = createCompleter([
      ['abc', 'gloss 1'],
      ['abc', 'gloss 2'],
    ]);
    const results = completer.complete('abc');

    expect(results).toHaveLength(1);
    expect(results[0].displayText).toBe('abc');
    expect(results[0].description).toBe('gloss 1/gloss 2');
  });

  test('preserves initial capitalization when the prefix starts uppercase', () => {
    const completer = createCompleter([
      ['ab', 'short'],
      ['aba', 'longer'],
      ['abc', 'gloss'],
      ['abd', 'sibling'],
    ]);
    const results = completer.complete('Ab');

    expect(results.map((candidate) => candidate.displayText)).toEqual([
      'Ab',
      'Aba',
      'Abc',
      'Abd',
    ]);
  });

  test('keeps explicit uppercase matches and lowered matches in uppercase search results', () => {
    const completer = createCompleter([
      ['Abc', 'explicit uppercase'],
      ['abc', 'gloss 1'],
      ['abc', 'gloss 2'],
    ]);
    const results = completer.complete('Abc');

    expect(results.map((candidate) => ({
      displayText: candidate.displayText,
      description: candidate.description,
    }))).toEqual([
      { displayText: 'Abc', description: 'explicit uppercase' },
      { displayText: 'Abc', description: 'gloss 1/gloss 2' },
    ]);
  });
});
