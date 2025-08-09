export interface CommandResult {
  command: string;
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface ErrorOutput {
  message: string;
  results: CommandResult[];
}

export interface Hook {
  type: string;
  command: string;
}

export interface PostToolUseItem {
  matcher: string;
  hooks: Hook[];
}

export interface Settings {
  hooks: {
    PostToolUse: PostToolUseItem[];
  };
}

export interface CLIOptions {
  commands: string[];
  parallel?: boolean;
  message?: string;
  init?: boolean;
  version?: boolean;
}
