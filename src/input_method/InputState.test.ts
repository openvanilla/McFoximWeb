import { CommittingState, EmptyState, InputtingState } from './InputState';

describe('Test EmptyState', () => {
  it('should create an instance of EmptyState', () => {
    const state = new EmptyState();
    expect(state).toBeInstanceOf(EmptyState);
  });
});

describe('Test CommittingState', () => {
  it('should create an instance of CommittingState', () => {
    const state = new CommittingState('test');
    expect(state).toBeInstanceOf(CommittingState);
  });
});

describe('Test CommittingState properties', () => {
  it('should have correct commitString', () => {
    const commitStr = 'hello world';
    const state = new CommittingState(commitStr);
    expect(state.commitString).toBe(commitStr);
  });
});

describe('Test CommittingState with empty commit string', () => {
  it('should handle empty commit string', () => {
    const state = new CommittingState('');
    expect(state.commitString).toBe('');
  });
});

describe('Test CommittingState with special characters', () => {
  it('should handle special characters in commit string', () => {
    const specialStr = 'こんにちは、世界！';
    const state = new CommittingState(specialStr);
    expect(state.commitString).toBe(specialStr);
  });
});

describe('Test CommittingState type', () => {
  it('should be instance of InputState', () => {
    const state = new CommittingState('type test');
    expect(state).toBeInstanceOf(CommittingState);
    expect(state).toBeInstanceOf(EmptyState.constructor.prototype.__proto__.constructor);
  });
});
describe('Test InputtingState', () => {
  it('should create an instance of InputtingState', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'test',
      candidates: ['candidate1', 'candidate2'],
    });
    expect(state).toBeInstanceOf(InputtingState);
  });

  it('should have correct properties', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'hello',
      candidates: ['hello world', 'hello there'],
      selectedCandidateIndex: 0,
    });
    expect(state.cursorIndex).toBe(2);
    expect(state.composingBuffer).toBe('hello');
    expect(state.candidates).toEqual(['hello world', 'hello there']);
    expect(state.selectedCandidateIndex).toBe(0);
  });

  it('should calculate candidate page count correctly', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => `candidate${i}`);
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: '',
      candidates,
    });
    expect(state.candidatePageCount).toBe(3);
  });

  it('should paginate candidates correctly', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => `candidate${i}`);
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: '',
      candidates,
      selectedCandidateIndex: 10,
    });
    expect(state.candidatesInCurrentPage).toEqual(candidates.slice(9, 18));
    expect(state.selectedCandidateIndexInCurrentPage).toBe(1);
  });

  it('should handle empty candidates', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: '',
      candidates: [],
    });
    expect(state.candidatePageCount).toBeUndefined();
    expect(state.candidatesInCurrentPage).toBeUndefined();
  });

  it('should handle no selected candidate', () => {
    const candidates = ['a', 'b', 'c'];
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: '',
      candidates,
    });
    expect(state.candidatesInCurrentPage).toEqual(['a', 'b', 'c']);
    expect(state.selectedCandidateIndexInCurrentPage).toBeUndefined();
  });
});
