import type { CommandResult, ErrorOutput } from '../types/index.js';

export function outputError(message: string | undefined, results: CommandResult[]): void {
  const errorMessage = message || `${results.length} command(s) failed`;
  
  const output: ErrorOutput = {
    message: errorMessage,
    results
  };

  console.error(JSON.stringify(output, null, 2));
}