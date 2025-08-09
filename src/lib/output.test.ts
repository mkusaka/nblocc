import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { outputError } from './output.js';
import type { CommandResult } from '../types/index.js';

describe('outputError', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should output error with custom message', () => {
    const results: CommandResult[] = [
      {
        command: 'test command',
        exitCode: 1,
        stderr: 'error',
        stdout: 'output'
      }
    ];

    outputError('Custom error message', results);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    
    expect(output.message).toBe('Custom error message');
    expect(output.results).toEqual(results);
  });

  it('should use default message when not provided', () => {
    const results: CommandResult[] = [
      {
        command: 'cmd1',
        exitCode: 1,
        stderr: 'err1',
        stdout: 'out1'
      },
      {
        command: 'cmd2',
        exitCode: 2,
        stderr: 'err2',
        stdout: 'out2'
      }
    ];

    outputError(undefined, results);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    
    expect(output.message).toBe('2 command(s) failed');
    expect(output.results).toEqual(results);
  });

  it('should format output as indented JSON', () => {
    const results: CommandResult[] = [
      {
        command: 'test',
        exitCode: 1,
        stderr: 'error',
        stdout: 'output'
      }
    ];

    outputError('Test', results);

    const outputString = consoleErrorSpy.mock.calls[0][0];
    
    // Check that it's properly formatted JSON with indentation
    expect(outputString).toContain('{\n');
    expect(outputString).toContain('  "message"');
    expect(outputString).toContain('  "results"');
  });
});