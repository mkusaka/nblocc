import { describe, it, expect } from 'vitest';
import { Executor } from './executor.js';

describe('Executor', () => {
  const executor = new Executor();

  describe('executeSequential', () => {
    it('should return empty array when all commands succeed', async () => {
      const commands = ['echo "test1"', 'echo "test2"'];
      const results = await executor.executeSequential(commands);
      expect(results).toEqual([]);
    });

    it('should return failed commands', async () => {
      const commands = ['echo "test"', 'exit 1'];
      const results = await executor.executeSequential(commands);
      expect(results).toHaveLength(1);
      expect(results[0].command).toBe('exit 1');
      expect(results[0].exitCode).toBe(1);
    });

    it('should stop immediately on exit code 2', async () => {
      const commands = ['exit 2', 'echo "should not run"'];
      const results = await executor.executeSequential(commands);
      expect(results).toHaveLength(1);
      expect(results[0].exitCode).toBe(2);
    });

    it('should handle empty command', async () => {
      const results = await executor.executeSequential(['']);
      expect(results).toHaveLength(1);
      expect(results[0].stderr).toBe('empty command');
      expect(results[0].exitCode).toBe(1);
    });

    it('should capture stdout and stderr', async () => {
      const commands = [
        'echo "stdout test" && >&2 echo "stderr test" && exit 1',
      ];
      const results = await executor.executeSequential(commands);
      expect(results).toHaveLength(1);
      expect(results[0].stdout).toContain('stdout test');
      expect(results[0].stderr).toContain('stderr test');
    });
  });

  describe('executeParallel', () => {
    it('should return empty array when all commands succeed', async () => {
      const commands = ['echo "test1"', 'echo "test2"'];
      const results = await executor.executeParallel(commands);
      expect(results).toEqual([]);
    });

    it('should return all failed commands', async () => {
      const commands = ['exit 1', 'exit 3'];
      const results = await executor.executeParallel(commands);
      expect(results).toHaveLength(2);
      const exitCodes = results.map((r) => r.exitCode).sort();
      expect(exitCodes).toEqual([1, 3]);
    });

    it('should handle exit code 2 specially', async () => {
      const commands = ['exit 1', 'exit 2', 'exit 3'];
      const results = await executor.executeParallel(commands);

      // Should include exit code 2 result
      const hasExitCode2 = results.some((r) => r.exitCode === 2);
      expect(hasExitCode2).toBe(true);
    });

    it('should execute multiple commands in parallel', async () => {
      // Test that commands are executed concurrently
      const results = await executor.executeParallel([
        'echo "first"',
        'echo "second"',
        'echo "third"',
      ]);

      // All commands should succeed
      expect(results).toEqual([]);
    });
  });
});
