/**
 * UI adapter used by InputController.
 *
 * Implementations receive composition updates, commit text to the host
 * environment, and clear any visible input-method UI when the state resets.
 */
export interface InputUI {
  /** Resets the UI. */
  reset(): void;

  /**
   * Commits text to the host application.
   * @param text The text to commit.
   */
  commitString(text: string): void;

  /**
   * Updates the visible composition and candidate UI state.
   * @param state Serialized UI state produced by InputUIStateBuilder.
   */
  update(state: string): void;
}

/**
 * Marker interface for structured UI state objects before serialization.
 */
export interface InputUIState {}
