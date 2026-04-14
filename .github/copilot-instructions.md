# GitHub Copilot Instructions for McFoximWeb

This document records the current repository layout, tooling, and workflow so coding agents can work from the code that is actually in this workspace.

## Project Overview

McFoximWeb (小麥族語輸入法) is a TypeScript-based input method for Taiwan Indigenous Languages. The repository currently supports:

- Web browsers
- Chrome OS through a Chrome extension bundle
- Windows through PIME

The core behavior is prefix-based candidate lookup over prebuilt vocabulary tables.

## Current Technology Stack

- **Language**: TypeScript 6
- **Package Manager**: npm with `package-lock.json`
- **Build Tooling**: Webpack 5 with `ts-loader`
- **Testing**: Jest 30 with `ts-jest` and `jsdom`
- **Linting**: ESLint 10 with flat config in `eslint.config.cjs`
- **Formatting**: Prettier
- **Compiler Settings**: `strict: true`, `module: commonjs`, `target: es6`

## Repository Structure

```text
McFoximWeb/
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── index.ts
│   ├── chromeos_ime.ts
│   ├── pime.ts
│   ├── pime_keys.ts
│   ├── engine/
│   │   ├── Candidate.ts
│   │   ├── Completer.ts
│   │   ├── Completer.test.ts
│   │   └── index.ts
│   ├── input_method/
│   │   ├── InputController.ts
│   │   ├── InputState.ts
│   │   ├── InputUI.ts
│   │   ├── InputUIElements.ts
│   │   ├── Key.ts
│   │   ├── KeyHandler.ts
│   │   ├── KeyMapping.ts
│   │   ├── *.test.ts
│   │   └── index.ts
│   └── data/
│       ├── TW_00.ts ... TW_42.ts
│       ├── index.ts
│       └── index.test.ts
├── tools/
│   ├── convert.py
│   ├── README.md
│   ├── requirements.txt
│   └── run.sh
├── output/
├── resource/
├── eslint.config.cjs
├── jest.config.js
├── tsconfig.json
├── webpack.config.js
├── webpack.config.chromeext.js
├── webpack.config.pime.js
└── build_pime.bat
```

## Important Current Facts

### Data Tables

- `src/data/` contains **42** vocabulary modules.
- The current set is `TW_00` through `TW_42`, with **`TW_11` missing**.
- `TW_12` exists and is enabled.
- `src/data/index.ts` is the authoritative registry of enabled tables.

### Validation Status

As verified in this workspace on **March 18, 2026**:

- `npm run ts-build` passes
- `npm run test -- --runInBand` passes: **7 suites, 172 tests**
- `npm run eslint` passes

Treat those commands as part of the normal green-path validation flow unless the workspace changes.

### Build Outputs

- `npm run build` writes `output/example/bundle.js`
- `npm run build:chromeos` writes `output/chromeos/bundle.js`
- `npm run build:pime` writes `output/pime/index.js`
- `npm run ts-build` writes JavaScript and declaration output to `dist/`

## Core Concepts

### Input Method Flow

1. Users type Latin letters.
2. `Completer` performs prefix search on the selected input table.
3. `KeyHandler` turns key events into `InputState` transitions.
4. `InputController` applies those transitions, updates the UI, and commits text when needed.
5. Candidate navigation uses Tab, arrow keys, and paging behavior.

### Main Code Areas

- `src/engine/Completer.ts`: prefix search over sorted vocabulary rows
- `src/input_method/KeyHandler.ts`: keyboard semantics and state transitions
- `src/input_method/InputController.ts`: orchestration between key handling, UI updates, and commits
- `src/input_method/InputState.ts`: state model for idle, inputting, and committing
- `src/input_method/InputUIElements.ts`: conversion from state to UI payloads
- `src/data/index.ts`: input table registry and selection
- `src/pime.ts`: PIME integration and request handling
- `src/pime_keys.ts`: Windows virtual key conversion

## Development Workflow

### Install

```bash
npm install
```

### Common Commands

```bash
# Build outputs
npm run build
npm run build:chromeos
npm run build:pime
npm run ts-build

# Watch mode
npm run build:watch
npm run ts-build:watch

# Validation
npm run test
npm run test -- --runInBand
npm run test:coverage
npm run eslint
```

### PIME Deployment

For local Windows deployment, `build_pime.bat` currently:

1. Runs `npm run build:pime`
2. Deletes `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`
3. Copies `output\pime` into that directory
4. Reminds the user to restart PIME Launcher

The script is functional, but its header comments are placeholder boilerplate and should not be treated as authoritative documentation.

## Coding Guidance for Agents

### TypeScript

- Preserve `strict` mode assumptions.
- Prefer explicit types over `any`.
- Keep source compatible with the current `commonjs` / `es6` TypeScript output settings.
- `tsconfig.json` excludes tests and platform-specific entry points from `ts-build`; do not assume every `src/` file is part of the library compiler output.

### Tests

- Place tests next to implementation files using the `.test.ts` suffix.
- Current test coverage exists in `src/engine`, `src/input_method`, and `src/data`.
- Use `jsdom`-friendly patterns for DOM-related behavior.
- When changing keyboard semantics or state transitions, update the adjacent tests.

### Linting

- The repository uses `eslint.config.cjs`, not `.eslintrc.*`.
- The configured rule set is intentionally light.
- Do not assume import ordering or stylistic rules that are not explicitly configured.

### File Naming

- PascalCase for class-oriented files and major components
- camelCase for platform/bootstrap files such as `chromeos_ime.ts` and `pime.ts`
- `.test.ts` for tests

## Common Tasks

### Modifying Input Behavior

- Update `src/input_method/KeyHandler.ts` for key semantics.
- Update `src/input_method/InputController.ts` for UI and commit flow changes.
- Update `src/input_method/InputState.ts` for state model changes.
- Update `src/input_method/InputUIElements.ts` if the UI payload changes.
- Add or revise adjacent tests.

### Working with PIME

- `src/pime.ts` handles PIME lifecycle and input events such as `init`, `close`, `onActivate`, `onDeactivate`, `filterKeyDown`, `filterKeyUp`, `onKeyDown`, `onKeyboardStatusChanged`, `onCompositionTerminated`, `onCommand`, and `onMenu`.
- `src/pime_keys.ts` converts Windows virtual key codes into the internal `Key` model.
- Settings are stored under `%APPDATA%\\PIME\\mcfoxim\\config.json`.

### Updating Vocabulary Data

1. Download the Excel archives from the ILRDF resources site.
2. Place the extracted Excel files in `tools/`.
3. Create a Python virtual environment in `tools/`.
4. Install `tools/requirements.txt`.
5. Run `python convert.py`.
6. Replace or add the generated `src/data/TW_XX.ts` files.
7. Update `src/data/index.ts` so `InputTableManager` includes the intended tables.

## Known Documentation Drift

Older instructions may still be wrong about these points:

- They may describe the project as Web-only or Web + Chrome OS only. Windows/PIME is active.
- They may reference `.eslintrc.cjs`. The repo now uses `eslint.config.cjs`.
- They may describe the data set incorrectly. The current repo includes `TW_00` and `TW_12`, excludes `TW_11`, and has 42 table modules.
- They may omit generated directories such as `dist/`, `coverage/`, and `output/`.
- They may claim `npm run ts-build` is broken. In this workspace, it is green as of March 18, 2026.

## Resources

- Project repository: https://github.com/openvanilla/McFoximWeb
- PIME repository: https://github.com/EasyIME/PIME
- ILRDF glossary resources: https://glossary.ilrdf.org.tw/resources
- Klokah vocabulary resources: https://web.klokah.tw/vocabulary/
