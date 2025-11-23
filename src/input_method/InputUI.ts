/**
 * The interface for the input UI.
 */
export interface InputUI {
  /** Resets the UI. */
  reset(): void;
  /**
   * Commits a string.
   * @param text The string to commit.
   */
  commitString(text: string): void;
  /**
   * Updates the UI.
   * @param state The new state.
   */
  update(state: string): void;
}

/**
 * The state of the input UI.
 */
export interface InputUIState {}
