import { InputTableManager } from '../data';
import { Candidate } from '../engine';
import Completer from '../engine/Completer';
import { CommittingState, EmptyState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';
import { KeyHandler } from './KeyHandler';

describe('Test KeyHandler', () => {
  // Add tests here
  it('should pass key with empty state', () => {
    const state = new EmptyState();
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {},
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(false);
  });

  it('should enter key with empty state', () => {
    const state = new EmptyState();
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('a', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('a');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should enter key with inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('c', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('ac');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should enter key with inputting state at begin', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('c', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('ca');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle tab with candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.TAB);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('aaa ');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle tab with candidates', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'aaa',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.TAB);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('aaa');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle ESC but doing thing', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'aaa',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.ESC);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle backspace at end of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [new Candidate('abc', ''), new Candidate('abd', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.BACKSPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('ab');
          expect(newState.cursorIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle backspace at middle of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.BACKSPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('ac');
          expect(newState.cursorIndex).toBe(1);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should return empty state after backspace removes all characters', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.BACKSPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof EmptyState).toBe(true);
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should not handle backspace at cursor position 0', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.BACKSPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(false);
  });

  it('should handle delete at end of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [new Candidate('abc', ''), new Candidate('abd', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DELETE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(false);
  });

  it('should handle delete at middle of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DELETE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('ac');
          expect(newState.cursorIndex).toBe(1);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should return empty state after delete removes all characters', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DELETE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof EmptyState).toBe(true);
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle left arrow key', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.LEFT);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.cursorIndex).toBe(1);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle right arrow key', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.RIGHT);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.cursorIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle up arrow key to cycle candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(0);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle up arrow key with wraparound', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle left arrow key at cursor position 0', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.LEFT);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle right arrow key at end of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.RIGHT);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle up arrow key with no candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle down arrow key in inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {},
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should convert apostrophe to right single quotation mark', () => {
    const state = new EmptyState();
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key("'", KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('’');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should convert apostrophe to right single quotation mark in inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key("'", KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('a’');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle down arrow key to cycle candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle down arrow key with wraparound', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 2,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(0);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle down arrow key with no candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle page down key to move to next page of candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [
        new Candidate('aaa', ''),
        new Candidate('aab', ''),
        new Candidate('aac', ''),
        new Candidate('aad', ''),
        new Candidate('aae', ''),
        new Candidate('aaf', ''),
        new Candidate('aag', ''),
        new Candidate('aah', ''),
        new Candidate('aai', ''),
        new Candidate('aaj', ''),
        new Candidate('aak', ''),
      ],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBeGreaterThan(0);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle page down key at end of candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 2,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle page down key with no candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_DOWN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle page up key to move to previous page of candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [
        new Candidate('aaa', ''),
        new Candidate('aab', ''),
        new Candidate('aac', ''),
        new Candidate('aad', ''),
        new Candidate('aae', ''),
        new Candidate('aaf', ''),
        new Candidate('aag', ''),
        new Candidate('aah', ''),
        new Candidate('aai', ''),
        new Candidate('aaj', ''),
        new Candidate('aak', ''),
      ],
      selectedCandidateIndex: 5,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBeLessThan(5);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle page up key at beginning of candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(0);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle page up key with no candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.PAGE_UP);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle home key', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.HOME);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.cursorIndex).toBe(0);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle end key', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.END);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.cursorIndex).toBe(3);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle home key at cursor position 0', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.HOME);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle end key at end of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.END);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle number key 1 to select candidate', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', ''), new Candidate('aac', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('1', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('aaa');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle number key 9 to select candidate', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [
        new Candidate('aaa', ''),
        new Candidate('aab', ''),
        new Candidate('aac', ''),
        new Candidate('aad', ''),
        new Candidate('aae', ''),
        new Candidate('aaf', ''),
        new Candidate('aag', ''),
        new Candidate('aah', ''),
        new Candidate('aai', ''),
      ],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('9', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('aai');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle number key 5 to select middle candidate', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [
        new Candidate('aaa', ''),
        new Candidate('aab', ''),
        new Candidate('aac', ''),
        new Candidate('aad', ''),
        new Candidate('aae', ''),
      ],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('5', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('aae');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should call error callback when number key out of range', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('5', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should call error callback when number key pressed with no candidates', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('1', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle number keys 2-8', () => {
    for (let i = 2; i <= 8; i++) {
      const state = new InputtingState({
        cursorIndex: 1,
        composingBuffer: 'a',
        candidates: Array.from({ length: 9 }, (_, idx) => new Candidate(`candidate${idx}`, '')),
        selectedCandidateIndex: 0,
      });
      const completer = new Completer(() => InputTableManager.getInstance().currentTable);
      const keyHandler = new KeyHandler(completer);
      const key = new Key(i.toString(), KeyName.ASCII);
      const result = keyHandler.handle(
        key,
        state,
        (newState) => {
          expect(newState instanceof CommittingState).toBe(true);
          if (newState instanceof CommittingState) {
            expect(newState.commitString).toBe(`candidate${i - 1}`);
          }
        },
        () => {
          fail('Expected to handle key successfully');
        },
      );
      expect(result).toBe(true);
    }
  });

  it('should handle return key with composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [new Candidate('abc', ''), new Candidate('abd', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.RETURN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('abc ');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle return key with empty composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: '',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.RETURN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle return key at cursor middle of buffer', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'abcde',
      candidates: [new Candidate('abcde', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.RETURN);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('abcde ');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle space key with inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [new Candidate('aaa', ''), new Candidate('aab', '')],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key(' ', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('a ');
          expect(newState.cursorIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle space key in middle of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key(' ', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('a bc');
          expect(newState.cursorIndex).toBe(2);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle space key at beginning of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key(' ', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe(' ');
        }

        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('abc');
          expect(newState.cursorIndex).toBe(0);
        }
      },
      () => {},
    );
    expect(result).toBe(true);
  });

  it('should handle space key at end of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [new Candidate('abc', '')],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key(' ', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof InputtingState).toBe(true);
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('abc ');
          expect(newState.cursorIndex).toBe(4);
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should reject space key with empty state', () => {
    const state = new EmptyState();
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key(' ', KeyName.SPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(false);
  });

  it('should handle printable character @ with inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('@', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('a@');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle printable character # with inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 2,
      composingBuffer: 'ab',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('#', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('ab#');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle printable character $ at middle of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('$', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('a$bc');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle printable character % at beginning of composing buffer', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('%', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('%abc');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle printable character ! with empty state', () => {
    const state = new EmptyState();
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('!', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        fail('Should not update state');
      },
      () => {},
    );
    expect(result).toBe(false);
  });

  it('should handle printable character & with inputting state', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'abc',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('&', KeyName.ASCII);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        expect(newState instanceof CommittingState).toBe(true);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('abc&');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle space at beginning after backspace', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: 'a ',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.BACKSPACE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof EmptyState).toBe(true);
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should handle space at beginning after delete', () => {
    const state = new InputtingState({
      cursorIndex: 1,
      composingBuffer: ' a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DELETE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        // console.log(newState);
        expect(newState instanceof EmptyState).toBe(true);
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });

  it('should prevent space at beginning after delete', () => {
    const state = new InputtingState({
      cursorIndex: 0,
      composingBuffer: 'a a',
      candidates: [],
    });
    const completer = new Completer(() => InputTableManager.getInstance().currentTable);
    const keyHandler = new KeyHandler(completer);
    const key = new Key('', KeyName.DELETE);
    const result = keyHandler.handle(
      key,
      state,
      (newState) => {
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe(' ');
        }
        if (newState instanceof InputtingState) {
          expect(newState.composingBuffer).toBe('a');
        }
      },
      () => {
        fail('Expected to handle key successfully');
      },
    );
    expect(result).toBe(true);
  });
});
