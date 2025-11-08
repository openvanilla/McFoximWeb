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
- **Target Platforms**: Web browsers, Chrome OS (via Chrome extension), and Windows (via PIME)

## Project Structure

```
McFoximWeb/
├── src/
│   ├── index.ts              # Main entry point, exports public API
│   ├── chromeos_ime.ts       # Chrome OS specific input method implementation
│   ├── pime.ts               # PIME (Windows) specific input method implementation
│   ├── pime_keys.ts          # Windows virtual key code mapping for PIME
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
│   ├── chromeos/             # Chrome OS extension package
│   └── pime/                 # PIME Windows input method package
├── webpack.config.js         # Webpack configuration for Web build
├── webpack.config.chromeext.js # Webpack configuration for Chrome OS build
├── webpack.config.pime.js    # Webpack configuration for PIME (Windows) build
├── build_pime.bat            # Windows batch script to build and deploy PIME version
├── tsconfig.json             # TypeScript compiler configuration
├── jest.config.js            # Jest test configuration
├── .eslintrc.cjs             # ESLint configuration
└── .prettierrc.json          # Prettier configuration
```

## Key Concepts

### PIME (Platform-Independent Input Method Extension)
- **Framework**: PIME is a Windows input method framework that supports both Python and Node.js backends
- **Repository**: https://github.com/EasyIME/PIME
- **Architecture**: Uses Text Services Framework (TSF) with a native C++ frontend and script backends
- **Integration**: McFoximWeb integrates with PIME via Node.js backend to provide Windows IME support
- **Communication**: PIME sends requests (keyboard events, lifecycle events) and receives responses (UI states, candidate windows)

### PIME Integration Details
- **Entry Point**: `src/pime.ts` - Main module for PIME integration
- **Key Mapping**: `src/pime_keys.ts` - Maps Windows virtual key codes to McFoxim Key objects
- **Build Target**: Node.js/CommonJS (UMD format) for compatibility with PIME's Node backend
- **Deployment**: Built files are copied to `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`
- **Settings**: User preferences stored in `%APPDATA%\PIME\mcfoxim\config.json`

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

# PIME (Windows) version
npm run build:pime

# Development build with watch mode
npm run build:watch
```

### Building and Deploying PIME Version (Windows)
```batch
# Build and deploy to PIME installation (requires administrator privileges)
build_pime.bat

# This script:
# 1. Runs npm run build:pime
# 2. Deletes old files from C:\Program Files (x86)\PIME\node\input_methods\mcfoxim
# 3. Copies new build to PIME installation directory
# 4. Requires PIME Launcher restart to see changes
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

### Working with PIME Integration
1. **Testing PIME locally**: Build with `npm run build:pime` and deploy using `build_pime.bat` (Windows, admin required)
2. **Understanding PIME requests**: The `response()` function in `pime.ts` handles various PIME methods:
   - `init`, `close` - Lifecycle events
   - `onActivate`, `onDeactivate` - Focus events
   - `filterKeyDown`, `filterKeyUp` - Key event filtering
   - `onKeyDown` - Actual key processing
   - `onKeyboardStatusChanged` - IME on/off state
   - `onCompositionTerminated` - Composition cleanup
   - `onCommand`, `onMenu` - UI button and menu actions
3. **Key event conversion**: `KeyFromKeyboardEvent()` in `pime_keys.ts` converts Windows VK codes to McFoxim Key objects
4. **UI state mapping**: The `UiState` interface bridges McFoxim's InputController and PIME's expectations
5. **Settings management**: User settings are loaded from/saved to `%APPDATA%\PIME\mcfoxim\config.json`

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
- PIME version requires Windows 7 or later with PIME framework installed

### PIME Requirements
- Windows operating system (Windows 7+)
- PIME framework installed (https://github.com/EasyIME/PIME/releases)
- Node.js backend enabled in PIME
- Administrator privileges for installation/deployment

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
npm run test && npm run build && npm run build:chromeos && npm run build:pime

# Check TypeScript compilation only
npm run ts-build

# Windows: Build and deploy PIME version (requires admin)
build_pime.bat
```

## Troubleshooting

### PIME-Specific Issues
- **Module not loading**: Check that files are in `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`
- **Settings not persisting**: Verify `%APPDATA%\PIME\mcfoxim\config.json` exists and is writable
- **IME not appearing**: Restart PIME Launcher after deployment (`build_pime.bat` reminds you to do this)
- **Key events not working**: Check virtual key code mapping in `pime_keys.ts` and `KeyFromKeyboardEvent()`
- **Windows version compatibility**: Ensure Windows TSF is working and PIME is properly registered with `regsvr32`

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
- PIME Framework: https://github.com/EasyIME/PIME
- PIME Documentation: https://github.com/EasyIME/PIME/blob/master/README.md
- Windows TSF References: https://docs.microsoft.com/en-us/windows/win32/tsf/text-services-framework
- ISO 639-5 Language Codes: https://en.wikipedia.org/wiki/ISO_639-5
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Jest Documentation: https://jestjs.io/docs/getting-started
- Webpack Documentation: https://webpack.js.org/concepts/
