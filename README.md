# nblocc

Node.js implementation of [blocc](https://github.com/shuntaka9576/blocc) - A CLI tool that executes multiple commands and blocks Claude Code hooks by returning exit code 2 when any command fails.

## Features

- Execute multiple commands sequentially or in parallel
- JSON-formatted error output to stderr
- Claude Code hook integration support
- TypeScript implementation with full type safety
- Comprehensive test coverage with Vitest

## Installation

```bash
# Clone the repository
git clone https://github.com/mkusaka/nblocc.git
cd nblocc

# Install dependencies
pnpm install

# Build the project
pnpm build

# Link globally for CLI usage
pnpm link --global
```

## Usage

```bash
# Execute commands sequentially (default)
nblocc "npm run lint" "npm run test"

# Execute commands in parallel(-p)
nblocc --parallel "npm run lint" "npm run test" "npm run spell-check"

# Custom error message(-m)
nblocc --message "Hook execution completed with errors. Please address the following issues" "npm run lint" "npm run test"

# Initialize Claude Code hooks configuration
nblocc --init

# Or customize with your own commands
nblocc --init --message "Hook execution completed with errors" "npm run lint" "npm run test"
```

### Error Output Format

When commands fail, nblocc outputs a JSON structure to stderr:

```json
{
  "message": "2 command(s) failed",
  "results": [
    {
      "command": "npm run lint",
      "exitCode": 1,
      "stderr": "Linting errors found...",
      "stdout": "Checking 15 files..."
    },
    {
      "command": "npm run test",
      "exitCode": 1,
      "stderr": "Test failures...",
      "stdout": "Running test suite..."
    }
  ]
}
```

## Development

```bash
# Run in development mode
pnpm dev [commands...]

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build the project
pnpm build
```

## Technology Stack

- **TypeScript**: Type-safe implementation
- **tsx**: TypeScript execution for development
- **Vitest**: Testing framework
- **oxlint**: Fast linter
- **pnpm**: Package manager
- **Commander.js**: CLI framework

## License

MIT