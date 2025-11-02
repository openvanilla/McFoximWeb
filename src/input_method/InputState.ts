import { Candidate } from '../engine';

export abstract class InputState {}

export class EmptyState extends InputState {}

export class CommittingState extends InputState {
  readonly commitString: string;
  constructor(commitString: string) {
    super();
    this.commitString = commitString;
  }
}

export class InputtingState extends InputState {
  static readonly candidatesPerPage = 9;

  readonly cursorIndex: number;
  readonly composingBuffer: string;
  readonly candidates: Candidate[];
  readonly selectedCandidateIndex?: number | undefined;

  readonly candidatesInCurrentPage?: Candidate[];
  readonly selectedCandidateIndexInCurrentPage?: number | undefined;
  readonly candidatePageIndex?: number | undefined;
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
