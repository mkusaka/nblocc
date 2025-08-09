import { writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Settings } from '../types/index.js';

export async function initSettings(
  commands: string[] = [],
  message = ''
): Promise<void> {
  // Use defaults if not provided
  const defaultCommands = ['npx tsc --noEmit'];
  const defaultMessage = 'Hook execution completed with errors';
  
  if (commands.length === 0) {
    commands = defaultCommands;
  }
  if (!message) {
    message = defaultMessage;
  }

  const currentDir = process.cwd();
  const claudeDir = join(currentDir, '.claude');
  
  // Create .claude directory if it doesn't exist
  try {
    await mkdir(claudeDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${claudeDir}: ${error}`);
  }

  const settingsPath = join(claudeDir, 'settings.local.json');
  
  // Check if file already exists
  try {
    await stat(settingsPath);
    throw new Error(`settings.local.json already exists at ${settingsPath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Build command string
  const quotedCommands = commands.map(cmd => `"${cmd}"`);
  const commandStr = `nblocc --message "${message}" ${quotedCommands.join(' ')}`;

  // Create settings structure
  const settings: Settings = {
    hooks: {
      PostToolUse: [
        {
          matcher: 'Write|Edit|MultiEdit',
          hooks: [
            {
              type: 'command',
              command: commandStr
            }
          ]
        }
      ]
    }
  };

  // Write the file
  try {
    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write settings file: ${error}`);
  }

  // Replace home directory with ~ for display
  let displayPath = settingsPath;
  const home = homedir();
  if (settingsPath.startsWith(home)) {
    displayPath = '~' + settingsPath.slice(home.length);
  }

  console.log(`Successfully created settings.local.json at ${displayPath}`);
}