export default class Candidate {
  readonly displayText: string;
  readonly description: string;

  constructor(displayText: string, description: string) {
    this.displayText = displayText;
    this.description = description;
  }
}
