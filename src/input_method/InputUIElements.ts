import { Candidate } from '../engine';
import { InputtingState } from './InputState';

class CandidateWrapper {
  /** The key cap. */
  readonly keyCap: string = '';
  /** The candidate. */
  readonly candidate: Candidate = new Candidate('', '');
  /** If the candidate is selected. */
  readonly selected: boolean = false;

  constructor(keyCap: string, candidate: Candidate, selected: boolean) {
    this.keyCap = keyCap;
    this.candidate = candidate;
    this.selected = selected;
  }

  /** Returns the reading of the candidate. */
  get reading(): string {
    return this.candidate.text;
  }

  /** Returns the value of the candidate. */
  get value(): string {
    return this.candidate.text;
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
  /** Represents the composing buffer.   */
  readonly composingBuffer: ComposingBufferText[];

  /** The index of the cursor in the composing buffer. */
  readonly cursorIndex: number;

  /** The current page of the candidates. */
  readonly candidates: CandidateWrapper[];

  /** The total pages of the candidates, */
  readonly candidatePageCount: number;

  /** The current page index of the candidates, */
  readonly candidatePageIndex: number;

  constructor(
    composingBuffer: ComposingBufferText[],
    cursorIndex: number,
    candidates: CandidateWrapper[],
    candidatePageCount: number,
    candidatePageIndex: number,
  ) {
    this.composingBuffer = composingBuffer;
    this.cursorIndex = cursorIndex;
    this.candidates = candidates;
    this.candidatePageCount = candidatePageCount;
    this.candidatePageIndex = candidatePageIndex;
  }
}

export class InputUIStateBuilder {
  state: InputtingState;

  constructor(state: InputtingState) {
    this.state = state;
  }

  buildJsonString(): string {
    return JSON.stringify(this.build());
  }

  build(): InputUIState {
    const composingBufferTexts: ComposingBufferText[] = [];
    const text = this.state.composingBuffer;
    composingBufferTexts.push(new ComposingBufferText(text));

    const candidateWrappers: CandidateWrapper[] = [];
    if (this.state.candidatesInCurrentPage) {
      for (let i = 0; i < this.state.candidatesInCurrentPage.length; i++) {
        const candidate = this.state.candidatesInCurrentPage[i];
        const globalIndex =
          (this.state.candidatePageIndex ?? 0) * InputtingState.candidatesPerPage + i;
        const selected = globalIndex === (this.state.selectedCandidateIndex ?? -1);
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
