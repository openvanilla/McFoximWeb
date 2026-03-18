import { Candidate } from '../engine';

/**
 * Base type for the input method state machine.
 *
 * Each subclass describes a distinct stage in the input flow, such as idle,
 * active composition, or committing text back to the host application.
 */
export abstract class InputState {}

/** Idle state with no active composition or pending commit. */
export class EmptyState extends InputState {}

/**
 * Transitional state that carries text to be committed to the host.
 */
export class CommittingState extends InputState {
  /** Text that should be committed to the host application. */
  readonly commitString: string;
  constructor(commitString: string) {
    super();
    this.commitString = commitString;
  }
}

/**
 * Active composition state.
 *
 * Stores the current composing buffer, the caret position inside that buffer,
 * and the candidate list with paging information for the current selection.
 */
export class InputtingState extends InputState {
  /** Number of candidates shown on each page. */
  static readonly candidatesPerPage = 9;

  /** Caret position inside the composing buffer. */
  readonly cursorIndex: number;

  /** Raw text currently being composed. */
  readonly composingBuffer: string;

  /** Full candidate list returned for the composing buffer. */
  readonly candidates: Candidate[];

  /** Selected candidate index in the full candidate list. */
  readonly selectedCandidateIndex?: number | undefined;

  /** Candidates visible on the current page. */
  readonly candidatesInCurrentPage?: Candidate[];

  /** Selected candidate index within the current page. */
  readonly selectedCandidateIndexInCurrentPage?: number | undefined;

  /** Zero-based index of the current candidate page. */
  readonly candidatePageIndex?: number | undefined;

  /** Total number of candidate pages. */
  readonly candidatePageCount?: number | undefined;

  constructor(args: {
    cursorIndex: number;
    composingBuffer: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super();
    this.cursorIndex = args.cursorIndex;
    this.composingBuffer = args.composingBuffer;
    this.candidates = args.candidates;
    this.selectedCandidateIndex = args.selectedCandidateIndex;

    if (this.candidates.length > 0) {
      this.selectedCandidateIndex = args.selectedCandidateIndex ?? 0;
      this.candidatePageCount = Math.ceil(
        this.candidates.length / InputtingState.candidatesPerPage,
      );

      const pageIndex = Math.floor(this.selectedCandidateIndex / InputtingState.candidatesPerPage);
      const startIndex = pageIndex * InputtingState.candidatesPerPage;
      const endIndex = Math.min(
        startIndex + InputtingState.candidatesPerPage,
        this.candidates.length,
      );
      this.candidatesInCurrentPage = this.candidates.slice(startIndex, endIndex);
      this.selectedCandidateIndexInCurrentPage =
        this.selectedCandidateIndex % InputtingState.candidatesPerPage;
      this.candidatePageIndex = pageIndex;
    }
  }
}
