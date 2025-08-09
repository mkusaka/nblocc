#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Executor } from '../lib/executor.js';
import { outputError } from '../lib/output.js';
import { initSettings } from '../lib/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

program
  .name('nblocc')
  .description(
    'Node.js implementation of blocc - CLI tool that blocks Claude Code hooks by returning exit code 2 when commands fail',
  )
  .version(packageJson.version)
  .option('-p, --parallel', 'Execute commands in parallel')
  .option('-m, --message <message>', 'Custom error message')
  .option('-i, --init', 'Initialize settings.local.json')
  .argument('[commands...]', 'Commands to execute')
  .action(async (commands: string[], options) => {
    // Handle init flag
    if (options.init) {
      try {
        await initSettings(commands, options.message);
        process.exit(0);
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    }

    // Default behavior: run commands
    if (!commands || commands.length === 0) {
      console.error('Error: no commands provided');
      process.exit(1);
    }

    const executor = new Executor();

    try {
      const results = options.parallel
        ? await executor.executeParallel(commands)
        : await executor.executeSequential(commands);

      if (results.length > 0) {
        outputError(options.message, results);
        process.exit(2);
      }

      // All commands succeeded
      process.exit(0);
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

program.parse();
