# GitHub Copilot Instructions for McFoximWeb

This document provides instructions and context to help GitHub Copilot understand and work effectively with the McFoximWeb project.

## Project Overview

McFoximWeb (小麥族語輸入法) is a TypeScript-based input method for Taiwan Indigenous Languages, supporting both Web browsers and Chrome OS platforms. The project provides autocomplete functionality for indigenous language words based on vocabulary learning tables from the Council of Indigenous Peoples.

## Technology Stack

- **Language**: TypeScript (ES6+)
- **Build Tool**: Webpack 5
- **Testing Framework**: Jest 30 with jsdom
- **Linting**: ESLint with TypeScript support
- **Code Style**: Prettier
- **Target Platforms**: Web browsers and Chrome OS (via Chrome extension)

## Project Structure

```
McFoximWeb/
├── src/
│   ├── index.ts              # Main entry point, exports public API
│   ├── chromeos_ime.ts       # Chrome OS specific input method implementation
│   ├── engine/               # Core autocomplete engine
│   │   ├── Completer.ts      # Binary search-based word completion
│   │   ├── Candidate.ts      # Candidate word data structure
│   │   └── index.ts          # Engine module exports
│   ├── input_method/         # Input handling and UI components
│   │   ├── InputController.ts    # Main controller for input processing
│   │   ├── InputState.ts         # State management for input session
│   │   ├── InputUI.ts            # UI interface definition
│   │   ├── InputUIElements.ts    # UI element implementations
│   │   ├── Key.ts                # Key event handling
│   │   ├── KeyHandler.ts         # Keyboard input handler
│   │   ├── KeyMapping.ts         # Key mapping utilities
│   │   └── index.ts              # Input method module exports
│   └── data/                 # Language vocabulary data tables
│       ├── TW_*.ts           # 42 indigenous language datasets (TW_01 to TW_43, excluding TW_12)
│       └── index.ts          # Data module exports and InputTableManager
├── tools/                    # Conversion tools for vocabulary data
│   ├── convert.py            # Python script to convert Excel to TypeScript
│   └── README.md             # Instructions for data conversion process
├── output/                   # Build output directory
│   ├── example/              # Web version demo
│   └── chromeos/             # Chrome OS extension package
├── webpack.config.js         # Webpack configuration for Web build
├── webpack.config.chromeext.js # Webpack configuration for Chrome OS build
├── tsconfig.json             # TypeScript compiler configuration
├── jest.config.js            # Jest test configuration
├── .eslintrc.cjs             # ESLint configuration
└── .prettierrc.json          # Prettier configuration
```

## Key Concepts

### Input Method Flow
1. User types alphabetic characters
2. The Completer searches vocabulary tables using binary search
3. Matching candidates are displayed with translations
4. User can select candidates using Tab, arrow keys, or Page Up/Down

### Completer Algorithm
- Uses binary search for efficient prefix matching in sorted vocabulary data
- Each vocabulary table is a sorted array of `[word, translation]` tuples
- The Completer finds the first match and collects all consecutive matches

### Vocabulary Data
- Data files are TypeScript modules in `src/data/`
- Each file (TW_01 to TW_43) represents a different indigenous language/dialect
- Format: `export const TW_XX = [['word', 'translation'], ...]`
- Data is sourced from the Council of Indigenous Peoples vocabulary database

## Development Workflow

### Installation
```bash
npm install
```

### Building
```bash
# Web version
npm run build

# Chrome OS extension
npm run build:chromeos

# Development build with watch mode
npm run build:watch
```

### Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
npm run eslint
```

### TypeScript Compilation
```bash
# Compile TypeScript
npm run ts-build

# Watch mode
npm run ts-build:watch
```

## Coding Guidelines

### TypeScript Style
- Use strict mode (enabled in tsconfig.json)
- Prefer explicit types over `any`
- Use ES6+ features (arrow functions, destructuring, etc.)
- Follow ESLint rules defined in .eslintrc.cjs

### Import Organization
- Group imports: builtin, external, internal, parent/sibling/index
- Use alphabetical order within groups (enforced by ESLint)
- Maintain newlines between import groups

### Testing
- Write tests for all new functionality
- Place test files next to source files with `.test.ts` suffix
- Use Jest's `describe` and `it/test` blocks
- Mock DOM elements when needed using jsdom

### File Naming
- Use PascalCase for class files (e.g., `Completer.ts`)
- Use camelCase for utility files
- Use `.test.ts` suffix for test files

## Common Tasks

### Adding a New Language Dataset
1. Download Excel vocabulary file from indigenous language resource site
2. Place Excel file in `tools/` directory
3. Run `python convert.py` to generate TypeScript file
4. Move generated file to `src/data/` with appropriate TW_XX name
5. Update `src/data/index.ts` to export the new table

### Modifying Input Behavior
- Edit `KeyHandler.ts` for keyboard input processing
- Edit `InputController.ts` for overall input flow control
- Edit `InputState.ts` for state management logic
- Write tests in corresponding `.test.ts` files

### Adding UI Features
- Implement interface in `InputUI.ts`
- Add concrete implementation in `InputUIElements.ts`
- Update `InputController.ts` to use new UI features

## Important Notes

### Data Sources
- Vocabulary data from Council of Indigenous Peoples: https://glossary.ilrdf.org.tw/resources
- Additional data from Klokah E-learning: https://web.klokah.tw/vocabulary/

### License
- Code: MIT License
- Vocabulary data: Creative Commons (see Klokah CC license)

### Browser Compatibility
- Target: ES6+ browsers with DOM support
- Chrome OS extension requires Chrome/Chromium browser

### Performance Considerations
- Vocabulary tables are large (40+ files, each with thousands of entries)
- Binary search ensures O(log n) lookup performance
- Consider lazy loading of vocabulary data if memory is constrained

## Useful Commands for Development

```bash
# Quick iteration cycle
npm run build:watch  # Keep this running in one terminal
npm run test         # Run in another terminal after changes

# Full validation before commit
npm run test && npm run build && npm run build:chromeos

# Check TypeScript compilation only
npm run ts-build
```

## Troubleshooting

### ESLint Configuration Issues
- The project uses `.eslintrc.cjs` (CommonJS config)
- ESLint v9+ requires migration to `eslint.config.js` format
- The project currently uses ESLint 9.38.0 but has not yet migrated to the new config format
- See https://eslint.org/docs/latest/use/configure/migration-guide for migration instructions

### Build Failures
- Check Node.js version compatibility (project uses modern Node features)
- Ensure all dependencies are installed: `npm install`
- Clear output directory and rebuild: `rm -rf output && npm run build`

### Test Failures
- Tests use jsdom for DOM simulation
- Some tests may be environment-specific (check for timing issues)
- Run with `--verbose` flag for detailed output

## Resources

- Project Repository: https://github.com/openvanilla/McFoximWeb
- ISO 639-5 Language Codes: https://en.wikipedia.org/wiki/ISO_639-5
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Jest Documentation: https://jestjs.io/docs/getting-started
- Webpack Documentation: https://webpack.js.org/concepts/
