export default class Candidate {
  readonly text: string;
  readonly description: string;

  constructor(text: string, description: string) {
    this.text = text;
    this.description = description;
  }
}
