import { InputTable } from '../data';
import Completer from '../engine/Completer';
import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';

export class KeyHandler {
  private completer: Completer;

  constructor(completer: Completer) {
    this.completer = completer;
  }
  set inputTable(table: InputTable) {
    this.completer.inputTable = table;
  }

  private inputKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'".split(''); // Example input keys

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    if (state instanceof EmptyState) {
      if (!this.inputKeys.includes(key.ascii)) {
        return false;
      }
    }

    if (this.inputKeys.includes(key.ascii)) {
      let chr = key.ascii;
      if (chr === "'") {
        chr = '’';
      }
      if (state instanceof EmptyState) {
        const newComposingBuffer = chr;
        const candidates = this.completer.complete(newComposingBuffer);
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
        const candidates = this.completer.complete(newComposingBuffer);
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
      if (key.name === KeyName.TAB) {
        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          const newState = new CommittingState(selectedCandidate);
          stateCallback(newState);
        } else {
          const newState = new CommittingState(state.composingBuffer);
          stateCallback(newState);
        }
        return true;
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state.cursorIndex > 0) {
          const newComposingBuffer =
            state.composingBuffer.slice(0, state.cursorIndex - 1) +
            state.composingBuffer.slice(state.cursorIndex);
          const newCursorIndex = state.cursorIndex - 1;
          if (newComposingBuffer.length === 0) {
            const newState = new EmptyState();
            stateCallback(newState);
            return true;
          } else {
            const candidates = this.completer.complete(newComposingBuffer);
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
          const newComposingBuffer =
            state.composingBuffer.slice(0, state.cursorIndex) +
            state.composingBuffer.slice(state.cursorIndex + 1);
          const newCursorIndex = state.cursorIndex;
          if (newComposingBuffer.length === 0) {
            const newState = new EmptyState();
            stateCallback(newState);
            return true;
          } else {
            const candidates = this.completer.complete(newComposingBuffer);
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
    }

    errorCallback();
    return false;
  }
}
