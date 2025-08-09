import { spawn } from 'node:child_process';
import type { CommandResult } from '../types/index.js';

export class Executor {
  async executeSequential(commands: string[]): Promise<CommandResult[]> {
    const failedResults: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.executeCommand(command);
      if (result.exitCode !== 0) {
        failedResults.push(result);
        if (result.exitCode === 2) {
          // Exit immediately if exit code is 2
          return failedResults;
        }
      }
    }

    return failedResults;
  }

  async executeParallel(commands: string[]): Promise<CommandResult[]> {
    const promises = commands.map((command) => this.executeCommand(command));
    const results = await Promise.all(promises);

    const failedResults = results.filter((result) => result.exitCode !== 0);

    // If any command returned exit code 2, filter to only include those
    const exitCode2Results = failedResults.filter((r) => r.exitCode === 2);
    if (exitCode2Results.length > 0) {
      return exitCode2Results;
    }

    return failedResults;
  }

  private executeCommand(command: string): Promise<CommandResult> {
    return new Promise((resolve) => {
      const trimmedCommand = command.trim();

      if (!trimmedCommand) {
        resolve({
          command,
          exitCode: 1,
          stderr: 'empty command',
          stdout: '',
        });
        return;
      }

      const parts = trimmedCommand.split(/\s+/);
      const [cmd, ...args] = parts;
      let stdout = '';
      let stderr = '';

      const childProcess = spawn(cmd, args, {
        shell: true,
        stdio: 'pipe',
      });

      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('error', (error) => {
        resolve({
          command,
          exitCode: 1,
          stderr: error.message,
          stdout,
        });
      });

      childProcess.on('close', (code) => {
        resolve({
          command,
          exitCode: code ?? 1,
          stdout,
          stderr,
        });
      });
    });
  }
}
