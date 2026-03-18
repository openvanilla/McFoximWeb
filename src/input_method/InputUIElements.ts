import { Candidate } from '../engine';
import { InputtingState } from './InputState';

class CandidateWrapper {
  constructor(readonly keyCap: string, readonly candidate: Candidate, readonly selected: boolean) {}

  /** Returns the reading of the candidate. */
  get reading(): string {
    return this.candidate.displayText;
  }

  /** Returns the value of the candidate. */
  get value(): string {
    return this.candidate.displayText;
  }

  /** Returns the description of the candidate. */
  get description(): string {
    return this.candidate.description;
  }
}

enum ComposingBufferTextStyle {
  Normal = 'normal',
  Highlighted = 'highlighted',
}

class ComposingBufferText {
  readonly text: string;
  readonly style: ComposingBufferTextStyle;

  constructor(text: string, style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal) {
    this.text = text;
    this.style = style;
  }
}

class InputUIState {
  constructor(
    readonly composingBuffer: ComposingBufferText[],
    readonly cursorIndex: number,
    readonly candidates: CandidateWrapper[],
    readonly candidatePageCount: number,
    readonly candidatePageIndex: number,
  ) {}
}

/**
 * Builds the serialized UI payload for an InputtingState.
 *
 * This builder converts the internal input-method state into the compact JSON
 * structure expected by concrete UI implementations.
 */
export class InputUIStateBuilder {
  /**
   * Creates a builder for the given inputting state.
   * @param state The inputting state to serialize for the UI layer.
   */
  constructor(readonly state: InputtingState) {}

  /**
   * Builds the UI payload and returns it as a JSON string.
   * @returns The serialized UI payload.
   */
  buildJsonString(): string {
    return JSON.stringify(this.build());
  }

  /**
   * Builds the structured UI payload.
   * @returns The UI payload before JSON serialization.
   */
  build(): InputUIState {
    const composingBufferTexts: ComposingBufferText[] = [];
    const text = this.state.composingBuffer;
    composingBufferTexts.push(new ComposingBufferText(text));

    const candidateWrappers: CandidateWrapper[] = [];
    if (this.state.candidatesInCurrentPage) {
      for (let i = 0; i < this.state.candidatesInCurrentPage.length; i++) {
        const candidate = this.state.candidatesInCurrentPage[i];
        const selected = i === (this.state.selectedCandidateIndexInCurrentPage ?? -1);
        candidateWrappers.push(
          new CandidateWrapper(
            String.fromCharCode(49 + i), // '1' = 49 in ASCII
            candidate,
            selected,
          ),
        );
      }
    }
    return new InputUIState(
      composingBufferTexts,
      this.state.cursorIndex,
      candidateWrappers, // candidates
      this.state.candidatePageCount ?? 0,
      this.state.candidatePageIndex ?? 0,
    );
  }
}
