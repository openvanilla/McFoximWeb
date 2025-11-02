import { InputTableManager } from '../data';
import Completer from '../engine/Completer';
import { CommittingState, EmptyState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';
import { KeyHandler } from './KeyHandler';

describe('Test aKeyHandler', () => {
  // Add tests here
  it('should pass key with empty state', () => {
    const state = new EmptyState();
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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

  it('should handle tab with candidates', () => {
    const state = new InputtingState({
      cursorIndex: 3,
      composingBuffer: 'aaa',
      candidates: [],
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['abc', 'abd'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['abc', 'abd'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab', 'aac'],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab', 'aac'],
      selectedCandidateIndex: 0,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab', 'aac'],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab', 'aac'],
      selectedCandidateIndex: 1,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
      candidates: ['aaa', 'aab', 'aac'],
      selectedCandidateIndex: 2,
    });
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
    const completer = new Completer(InputTableManager.getInstance().currentTable);
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
});
