import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { initSettings } from './init.js';

vi.mock('node:fs/promises');

describe('initSettings', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.resetAllMocks();
  });

  it('should use default commands and message when not provided', async () => {
    vi.mocked(stat).mockRejectedValue({ code: 'ENOENT' });

    await initSettings();

    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('settings.local.json'),
      expect.stringContaining('npx tsc --noEmit'),
      'utf8',
    );

    const writtenContent = JSON.parse(
      vi.mocked(writeFile).mock.calls[0][1] as string,
    );
    expect(writtenContent.hooks.PostToolUse[0].hooks[0].command).toContain(
      'Hook execution completed with errors',
    );
  });

  it('should use provided commands and message', async () => {
    vi.mocked(stat).mockRejectedValue({ code: 'ENOENT' });

    await initSettings(['npm run lint', 'npm test'], 'Custom message');

    const writtenContent = JSON.parse(
      vi.mocked(writeFile).mock.calls[0][1] as string,
    );
    const command = writtenContent.hooks.PostToolUse[0].hooks[0].command;

    expect(command).toContain('Custom message');
    expect(command).toContain('npm run lint');
    expect(command).toContain('npm test');
  });

  it('should create .claude directory', async () => {
    vi.mocked(stat).mockRejectedValue({ code: 'ENOENT' });

    await initSettings();

    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('.claude'), {
      recursive: true,
    });
  });

  it('should throw error if settings.local.json already exists', async () => {
    vi.mocked(stat).mockResolvedValue({} as any);

    await expect(initSettings()).rejects.toThrow(
      'settings.local.json already exists',
    );
  });

  it('should create proper settings structure', async () => {
    vi.mocked(stat).mockRejectedValue({ code: 'ENOENT' });

    await initSettings(['test command']);

    const writtenContent = JSON.parse(
      vi.mocked(writeFile).mock.calls[0][1] as string,
    );

    expect(writtenContent).toHaveProperty('hooks');
    expect(writtenContent.hooks).toHaveProperty('PostToolUse');
    expect(writtenContent.hooks.PostToolUse).toHaveLength(1);
    expect(writtenContent.hooks.PostToolUse[0].matcher).toBe(
      'Write|Edit|MultiEdit',
    );
    expect(writtenContent.hooks.PostToolUse[0].hooks[0].type).toBe('command');
  });

  it('should log success message', async () => {
    vi.mocked(stat).mockRejectedValue({ code: 'ENOENT' });

    await initSettings();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Successfully created settings.local.json'),
    );
  });
});
