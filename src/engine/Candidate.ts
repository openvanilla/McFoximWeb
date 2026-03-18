/**
 * Candidate returned by the completer.
 *
 * `displayText` is the text that can be committed, and `description` is the
 * accompanying gloss shown in the candidate list.
 */
export default class Candidate {
  /**
   * Creates a candidate entry.
   * @param displayText The text that will be inserted if selected.
   * @param description The human-readable description for the candidate.
   */
  constructor(readonly displayText: string, public description: string) {}
}
