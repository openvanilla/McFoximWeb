export interface GreetOptions {
  punctuation?: string;
}

/**
 * Returns a friendly greeting for a given name.
 */
export function greet(name: string, options: GreetOptions = {}): string {
  const punc = options.punctuation ?? '!';
  const who = (name ?? '').trim() || 'World';
  return `Hello, ${who}${punc}`;
}

export default greet;
