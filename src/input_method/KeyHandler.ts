import Completer from '../engine/Completer';
import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';

/**
 * Handles key events.
 */
export class KeyHandler {
  constructor(private completer_: Completer) {}
  private inputKeys_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'^".split(''); // Example input keys

  /**
   * Handles a key event.
   * @param key The key event.
   * @param state The current input state.
   * @param stateCallback A callback to update the input state.
   * @param errorCallback A callback to be called when an error occurs.
   * @returns True if the key event was handled.
   */
  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (state instanceof EmptyState) {
      if (!this.inputKeys_.includes(key.ascii)) {
        return false;
      }
    }

    if (this.inputKeys_.includes(key.ascii)) {
      let chr = key.ascii;
      if (chr === "'") {
        chr = '’';
      }
      if (state instanceof EmptyState) {
        const newComposingBuffer = chr;
        const candidates = this.completer_.complete(newComposingBuffer);
        const newState = new InputtingState({
          cursorIndex: newComposingBuffer.length,
          composingBuffer: newComposingBuffer,
          candidates: candidates,
          selectedCandidateIndex: candidates.length > 0 ? 0 : undefined,
        });
        stateCallback(newState);
        return true;
      } else if (state instanceof InputtingState) {
        const newComposingBuffer =
          state.composingBuffer.slice(0, state.cursorIndex) +
          chr +
          state.composingBuffer.slice(state.cursorIndex);
        const newCursorIndex = state.cursorIndex + 1;
        const candidates = this.completer_.complete(newComposingBuffer);
        const newState = new InputtingState({
          cursorIndex: newCursorIndex,
          composingBuffer: newComposingBuffer,
          candidates: candidates,
          selectedCandidateIndex: candidates.length > 0 ? 0 : undefined,
        });
        stateCallback(newState);
        return true;
      }
    }

    if (state instanceof InputtingState) {
      // Perhaps handle tab key to commit the current candidate
      if (key.name === KeyName.TAB || key.name === KeyName.RETURN) {
        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          const newState = new CommittingState(selectedCandidate.displayText + ' ');
          stateCallback(newState);
        } else {
          const newState = new CommittingState(state.composingBuffer);
          stateCallback(newState);
        }
        return true;
      }

      if (key.ascii >= '1' && key.ascii <= '9') {
        const candidates = state.candidatesInCurrentPage;
        if (candidates === undefined || candidates.length === 0) {
          errorCallback();
        } else {
          const index = parseInt(key.ascii, 10) - 1;
          if (index > candidates.length - 1) {
            errorCallback();
            return true;
          }
          const selectedCandidate = candidates[index];
          const newState = new CommittingState(selectedCandidate.displayText);
          stateCallback(newState);
        }
        return true;
      }

      if (key.name === KeyName.SPACE) {
        if (state.cursorIndex === 0) {
          const current = state;
          stateCallback(new CommittingState(' '));
          stateCallback(current);
          return true;
        }
        const newComposingBuffer =
          state.composingBuffer.slice(0, state.cursorIndex) +
          ' ' +
          state.composingBuffer.slice(state.cursorIndex);
        const newCursorIndex = state.cursorIndex + 1;
        const candidates = this.completer_.complete(newComposingBuffer);
        const newState = new InputtingState({
          cursorIndex: newCursorIndex,
          composingBuffer: newComposingBuffer,
          candidates: candidates,
          selectedCandidateIndex: candidates.length > 0 ? 0 : undefined,
        });
        stateCallback(newState);
        return true;
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state.cursorIndex > 0) {
          let newComposingBuffer =
            state.composingBuffer.slice(0, state.cursorIndex - 1) +
            state.composingBuffer.slice(state.cursorIndex);
          const newCursorIndex = state.cursorIndex - 1;
          if (newComposingBuffer.length === 0) {
            const newState = new EmptyState();
            stateCallback(newState);
            return true;
          } else {
            if (newComposingBuffer[0] === ' ') {
              newComposingBuffer = newComposingBuffer.slice(1);
              if (newComposingBuffer.length === 0) {
                stateCallback(new EmptyState());
                return true;
              } else {
                stateCallback(new CommittingState(' '));
              }
            }
            const candidates = this.completer_.complete(newComposingBuffer);
            const newState = new InputtingState({
              cursorIndex: newCursorIndex,
              composingBuffer: newComposingBuffer,
              candidates: candidates,
              selectedCandidateIndex: candidates.length > 0 ? 0 : undefined,
            });
            stateCallback(newState);
            return true;
          }
        }
      }

      if (key.name === KeyName.DELETE) {
        if (state.cursorIndex < state.composingBuffer.length) {
          let newComposingBuffer =
            state.composingBuffer.slice(0, state.cursorIndex) +
            state.composingBuffer.slice(state.cursorIndex + 1);
          const newCursorIndex = state.cursorIndex;
          if (newComposingBuffer.length === 0) {
            const newState = new EmptyState();
            stateCallback(newState);
            return true;
          } else {
            if (newComposingBuffer[0] === ' ') {
              newComposingBuffer = newComposingBuffer.slice(1);
              if (newComposingBuffer.length === 0) {
                stateCallback(new EmptyState());
                return true;
              } else {
                stateCallback(new CommittingState(' '));
              }
            }
            const candidates = this.completer_.complete(newComposingBuffer);
            const newState = new InputtingState({
              cursorIndex: newCursorIndex,
              composingBuffer: newComposingBuffer,
              candidates: candidates,
              selectedCandidateIndex: candidates.length > 0 ? 0 : undefined,
            });
            stateCallback(newState);
            return true;
          }
        }
      }
      if (key.name === KeyName.LEFT) {
        if (state.cursorIndex > 0) {
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex - 1,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: state.selectedCandidateIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.RIGHT) {
        if (state.cursorIndex < state.composingBuffer.length) {
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex + 1,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: state.selectedCandidateIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.UP) {
        if (state.candidates.length > 0) {
          const newIndex =
            ((state.selectedCandidateIndex ?? 0) - 1 + state.candidates.length) %
            state.candidates.length;
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.DOWN) {
        if (state.candidates.length > 0) {
          const newIndex = ((state.selectedCandidateIndex ?? 0) + 1) % state.candidates.length;
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.PAGE_DOWN) {
        if (state.candidates.length > 0) {
          const candidatesPerPage = InputtingState.candidatesPerPage;
          const newIndex = Math.min(
            ((state.selectedCandidateIndex ?? 0) / candidatesPerPage + 1) * candidatesPerPage,
            state.candidates.length - 1,
          );
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.PAGE_UP) {
        if (state.candidates.length > 0) {
          const candidatesPerPage = InputtingState.candidatesPerPage;
          const newIndex = Math.max(
            Math.floor((state.selectedCandidateIndex ?? 0) / candidatesPerPage - 1) *
              candidatesPerPage,
            0,
          );
          const newState = new InputtingState({
            cursorIndex: state.cursorIndex,
            composingBuffer: state.composingBuffer,
            candidates: state.candidates,
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.HOME) {
        if (state.cursorIndex === 0) {
          errorCallback();
          return true;
        }
        const newState = new InputtingState({
          cursorIndex: 0,
          composingBuffer: state.composingBuffer,
          candidates: state.candidates,
          selectedCandidateIndex: state.selectedCandidateIndex,
        });
        stateCallback(newState);
        return true;
      }

      if (key.name === KeyName.END) {
        if (state.cursorIndex === state.composingBuffer.length) {
          errorCallback();
          return true;
        }
        const newState = new InputtingState({
          cursorIndex: state.composingBuffer.length,
          composingBuffer: state.composingBuffer,
          candidates: state.candidates,
          selectedCandidateIndex: state.selectedCandidateIndex,
        });
        stateCallback(newState);
        return true;
      }

      // Printable characters other than input keys are ignored
      if (key.ascii.length === 1) {
        const commitString =
          state.composingBuffer.slice(0, state.cursorIndex) +
          key.ascii +
          state.composingBuffer.slice(state.cursorIndex);
        const newState = new CommittingState(commitString);
        stateCallback(newState);
        return true;
      }
    }

    errorCallback();
    return false;
  }
}
