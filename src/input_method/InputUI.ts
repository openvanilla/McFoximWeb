export interface InputUI {
  reset(): void;
  commitString(text: string): void;
  update(state: string): void;
}

export interface InputUIState {}
