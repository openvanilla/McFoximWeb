export abstract class InputState {}

export class EmptyState extends InputState {}

export class CommittingState extends InputState {
  commitString: string;
  constructor(commitString: string) {
    super();
    this.commitString = commitString;
  }
}

export class InputtingState extends InputState {
  cursorIndex: number;
  composingBuffer: string;
  candidates: string[];
  constructor(args: { cursorIndex: number; composingBuffer: string; candidates: string[] }) {
    super();
    this.cursorIndex = args.cursorIndex;
    this.composingBuffer = args.composingBuffer;
    this.candidates = args.candidates;
  }
}
