import { InputUIStateBuilder } from './InputUIElements';
import { InputtingState } from './InputState';
import { Candidate } from '../engine';

describe('InputUIStateBuilder', () => {
  describe('build', () => {
    it('should build UI state with empty composing buffer and no candidates', () => {
      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: '',
        candidates: [],
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.composingBuffer).toHaveLength(1);
      expect(uiState.composingBuffer[0].text).toBe('');
      expect(uiState.cursorIndex).toBe(0);
      expect(uiState.candidates).toHaveLength(0);
      expect(uiState.candidatePageCount).toBe(0);
      expect(uiState.candidatePageIndex).toBe(0);
    });

    it('should build UI state with composing buffer text', () => {
      const inputtingState = new InputtingState({
        cursorIndex: 3,
        composingBuffer: 'abc',
        candidates: [],
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.composingBuffer).toHaveLength(1);
      expect(uiState.composingBuffer[0].text).toBe('abc');
      expect(uiState.cursorIndex).toBe(3);
      expect(uiState.candidates).toHaveLength(0);
    });

    it('should build UI state with candidates', () => {
      const candidates = [
        new Candidate('apple', 'fruit'),
        new Candidate('banana', 'fruit'),
        new Candidate('cherry', 'fruit'),
      ];

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 0,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(3);
      expect(uiState.candidates[0].keyCap).toBe('1');
      expect(uiState.candidates[0].reading).toBe('apple');
      expect(uiState.candidates[0].value).toBe('apple');
      expect(uiState.candidates[0].description).toBe('fruit');
      expect(uiState.candidates[0].selected).toBe(true);

      expect(uiState.candidates[1].keyCap).toBe('2');
      expect(uiState.candidates[1].selected).toBe(false);

      expect(uiState.candidates[2].keyCap).toBe('3');
      expect(uiState.candidates[2].selected).toBe(false);
    });

    it('should correctly mark selected candidate', () => {
      const candidates = [
        new Candidate('option1', 'desc1'),
        new Candidate('option2', 'desc2'),
        new Candidate('option3', 'desc3'),
      ];

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 1,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates[0].selected).toBe(false);
      expect(uiState.candidates[1].selected).toBe(true);
      expect(uiState.candidates[2].selected).toBe(false);
    });

    it('should handle 9 candidates per page', () => {
      const candidates = Array.from(
        { length: 9 },
        (_, i) => new Candidate(`option${i + 1}`, `desc${i + 1}`),
      );

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 0,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(9);
      expect(uiState.candidatePageCount).toBe(1);
      expect(uiState.candidatePageIndex).toBe(0);

      // Verify key caps are '1' through '9'
      for (let i = 0; i < 9; i++) {
        expect(uiState.candidates[i].keyCap).toBe(String(i + 1));
      }
    });

    it('should handle multiple pages of candidates', () => {
      const candidates = Array.from(
        { length: 20 },
        (_, i) => new Candidate(`option${i + 1}`, `desc${i + 1}`),
      );

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 0,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      // Should only show first 9 candidates (first page)
      expect(uiState.candidates).toHaveLength(9);
      expect(uiState.candidatePageCount).toBe(3); // 20 candidates = 3 pages (9+9+2)
      expect(uiState.candidatePageIndex).toBe(0);
    });

    it('should show correct candidates for second page', () => {
      const candidates = Array.from(
        { length: 20 },
        (_, i) => new Candidate(`option${i + 1}`, `desc${i + 1}`),
      );

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 9, // First candidate on second page
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(9);
      expect(uiState.candidatePageIndex).toBe(1);
      expect(uiState.candidates[0].reading).toBe('option10');
      expect(uiState.candidates[0].selected).toBe(true);
    });

    it('should show correct candidates for last page with fewer than 9 candidates', () => {
      const candidates = Array.from(
        { length: 20 },
        (_, i) => new Candidate(`option${i + 1}`, `desc${i + 1}`),
      );

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: 18, // First candidate on third page
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(2); // Only 2 candidates on last page
      expect(uiState.candidatePageIndex).toBe(2);
      expect(uiState.candidates[0].reading).toBe('option19');
      expect(uiState.candidates[0].selected).toBe(true);
      expect(uiState.candidates[1].reading).toBe('option20');
    });

    it('should handle no selected candidate index', () => {
      const candidates = [new Candidate('option1', 'desc1'), new Candidate('option2', 'desc2')];

      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: candidates,
        selectedCandidateIndex: undefined,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      // When selectedCandidateIndex is undefined, InputtingState defaults to 0
      expect(uiState.candidates[0].selected).toBe(true);
      expect(uiState.candidates[1].selected).toBe(false);
    });

    it('should handle undefined candidatesInCurrentPage', () => {
      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: 'test',
        candidates: [],
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const uiState = builder.build();

      expect(uiState.candidates).toHaveLength(0);
      expect(uiState.candidatePageCount).toBe(0);
      expect(uiState.candidatePageIndex).toBe(0);
    });
  });

  describe('buildJsonString', () => {
    it('should return valid JSON string', () => {
      const inputtingState = new InputtingState({
        cursorIndex: 2,
        composingBuffer: 'ab',
        candidates: [new Candidate('test', 'description')],
        selectedCandidateIndex: 0,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const jsonString = builder.buildJsonString();

      expect(() => JSON.parse(jsonString)).not.toThrow();

      const parsed = JSON.parse(jsonString);
      expect(parsed.composingBuffer).toHaveLength(1);
      expect(parsed.composingBuffer[0].text).toBe('ab');
      expect(parsed.cursorIndex).toBe(2);
      expect(parsed.candidates).toHaveLength(1);
    });

    it('should serialize empty state correctly', () => {
      const inputtingState = new InputtingState({
        cursorIndex: 0,
        composingBuffer: '',
        candidates: [],
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const jsonString = builder.buildJsonString();
      const parsed = JSON.parse(jsonString);

      expect(parsed.composingBuffer[0].text).toBe('');
      expect(parsed.candidates).toHaveLength(0);
      expect(parsed.candidatePageCount).toBe(0);
    });

    it('should serialize complex state with multiple candidates', () => {
      const candidates = Array.from(
        { length: 15 },
        (_, i) => new Candidate(`候選${i + 1}`, `說明${i + 1}`),
      );

      const inputtingState = new InputtingState({
        cursorIndex: 5,
        composingBuffer: '測試',
        candidates: candidates,
        selectedCandidateIndex: 10,
      });

      const builder = new InputUIStateBuilder(inputtingState);
      const jsonString = builder.buildJsonString();
      const parsed = JSON.parse(jsonString);

      expect(parsed.composingBuffer[0].text).toBe('測試');
      expect(parsed.cursorIndex).toBe(5);
      expect(parsed.candidatePageCount).toBe(2);
      expect(parsed.candidatePageIndex).toBe(1);
      expect(parsed.candidates).toHaveLength(6); // Second page has 6 candidates
    });
  });
});
