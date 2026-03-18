# GitHub Copilot Instructions for McFoximWeb

This document captures the current repository layout and development workflow so coding agents can work against the codebase as it exists now, not as it looked in earlier revisions.

## Project Overview

McFoximWeb (小麥族語輸入法) is a TypeScript-based input method for Taiwan Indigenous Languages. The repository currently targets:

- Web browsers
- Chrome OS via a Chrome extension build
- Windows via PIME

The core feature is prefix-based autocomplete over prebuilt vocabulary tables.

## Current Technology Stack

- **Language**: TypeScript 5
- **Package Manager**: npm with `package-lock.json`
- **Build Tool**: Webpack 5 with `ts-loader`
- **Testing Framework**: Jest 30 with `ts-jest` and `jsdom`
- **Linting**: ESLint 10 using flat config in `eslint.config.cjs`
- **Formatting**: Prettier
- **Module Output**:
  - `dist/` for the published TypeScript library output
  - `output/example/` for the Web demo bundle
  - `output/chromeos/` for the Chrome OS extension bundle
  - `output/pime/` for the PIME bundle

## Repository Structure

```text
McFoximWeb/
├── .github/
│   └── copilot-instructions.md  # This file; AGENTS.md points here
├── src/
│   ├── index.ts                 # Public library entry
│   ├── chromeos_ime.ts          # Chrome OS extension entry
│   ├── pime.ts                  # PIME entry
│   ├── pime_keys.ts             # Windows VK -> internal Key mapping
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
│       ├── TW_00.ts ... TW_42.ts  # Current data files
│       ├── index.ts
│       └── index.test.ts
├── tools/
│   ├── convert.py
│   ├── README.md
│   ├── requirements.txt
│   └── run.sh
├── dist/                        # TypeScript compiler output
├── coverage/                    # Jest coverage output
├── output/                      # Web / Chrome OS / PIME build artifacts
├── eslint.config.cjs            # ESLint flat config
├── jest.config.js
├── tsconfig.json
├── webpack.config.js
├── webpack.config.chromeext.js
├── webpack.config.pime.js
└── build_pime.bat
```

## Important Current Facts

### Data Tables

- `src/data/` currently contains **42** vocabulary modules.
- The current set is `TW_00` through `TW_42`, with **`TW_11` absent**.
- `TW_12` now exists and is included.
- `InputTableManager` in `src/data/index.ts` is the authoritative list of enabled tables.

### Validation Status

As of March 18, 2026 in this workspace:

- `npm run test -- --runInBand` passes: **7 suites, 172 tests**
- `npm run eslint` passes
- `npm run ts-build` currently **fails**

The current `ts-build` failure is a type conflict between `@types/eslint-scope` and ESLint's bundled types under `node_modules/`. Treat this as a known environment/dependency issue unless the task is specifically about fixing the TypeScript build pipeline.

### Build Outputs

- `npm run build` writes `output/example/bundle.js`
- `npm run build:chromeos` writes `output/chromeos/bundle.js`
- `npm run build:pime` writes `output/pime/index.js`
- `npm run ts-build` writes declaration and JS outputs into `dist/`

## Core Concepts

### Input Method Flow

1. Users type Latin letters.
2. `Completer` searches the selected table using binary search.
3. Candidates and translations are shown through the UI layer.
4. Selection is handled with Tab, arrow keys, and paging keys.

### Main Code Areas

- `src/engine/Completer.ts`: prefix search over sorted tables
- `src/input_method/InputController.ts`: top-level input flow orchestration
- `src/input_method/KeyHandler.ts`: keyboard handling rules
- `src/input_method/InputState.ts`: composition and candidate state
- `src/input_method/InputUIElements.ts`: concrete UI wiring
- `src/pime.ts`: PIME request handling and state mapping
- `src/pime_keys.ts`: Windows virtual key translation
- `src/data/index.ts`: table registry and selection

## Development Workflow

### Install

```bash
npm install
```

### Common Commands

```bash
# Library / demo / platform builds
npm run build
npm run build:chromeos
npm run build:pime

# Watch / local iteration
npm run build:watch
npm run ts-build:watch

# Validation
npm run test
npm run test:coverage
npm run eslint
npm run ts-build
```

### PIME Deployment

For local Windows deployment, `build_pime.bat` currently:

1. Runs `npm run build:pime`
2. Deletes `C:\Program Files (x86)\PIME\node\input_methods\mcfoxim`
3. Copies `output\pime` into that directory
4. Reminds the user to restart PIME Launcher

The script is functional but its header comments are placeholder boilerplate and should not be treated as authoritative documentation.

## Coding Guidance for Agents

### TypeScript

- Keep `strict` mode assumptions intact.
- Prefer explicit types instead of introducing `any`.
- Keep source compatible with the existing ES6/CommonJS compiler settings in `tsconfig.json`.

### Tests

- Place tests next to implementation files with `.test.ts`.
- Current tests cover `engine`, `input_method`, and `data`.
- Use `jsdom`-friendly patterns for DOM-facing code.

### Linting

- The repository no longer uses `.eslintrc.cjs`.
- Use the flat config in `eslint.config.cjs`.
- Existing configured rules are intentionally light; do not assume old import-order rules still exist unless they are added back.

### File Naming

- PascalCase for class-oriented files and major components
- camelCase for platform/bootstrap files such as `chromeos_ime.ts` and `pime.ts`
- `.test.ts` for tests

## Common Tasks

### Modifying Input Behavior

- Update `src/input_method/KeyHandler.ts` for key semantics.
- Update `src/input_method/InputController.ts` for flow changes.
- Update `src/input_method/InputState.ts` for state transitions.
- Add or update adjacent `.test.ts` files.

### Working with PIME

- `src/pime.ts` handles methods such as `init`, `close`, `onActivate`, `onDeactivate`, `filterKeyDown`, `filterKeyUp`, `onKeyDown`, `onKeyboardStatusChanged`, `onCompositionTerminated`, `onCommand`, and `onMenu`.
- `src/pime_keys.ts` converts Windows virtual key codes into the internal `Key` model.
- Settings are stored under `%APPDATA%\PIME\mcfoxim\config.json`.

### Updating Vocabulary Data

1. Download the Excel archives from the ILRDF resources site.
2. Place the extracted Excel files in `tools/`.
3. Create a Python virtual environment in `tools/`.
4. Install `tools/requirements.txt`.
5. Run `python convert.py`.
6. Replace or add the generated `src/data/TW_XX.ts` files.
7. Update `src/data/index.ts` so `InputTableManager` includes the right tables.

## Known Documentation Drift Fixed Here

Older copies of the instructions were wrong about these points:

- They said the project supported only Web and Chrome OS in the overview; Windows/PIME is also active.
- They referenced `.eslintrc.cjs`; the repo now uses `eslint.config.cjs`.
- They described the data set as `TW_01` to `TW_43` excluding `TW_12`; the current repo actually has 42 files, includes `TW_00` and `TW_12`, and does not have `TW_11`.
- They omitted generated directories such as `dist/` and `coverage/`.
- They assumed `ts-build` was a normal green-path validation step; in the current dependency state it fails for external type-definition reasons.

## Resources

- Project repository: https://github.com/openvanilla/McFoximWeb
- PIME repository: https://github.com/EasyIME/PIME
- ILRDF glossary resources: https://glossary.ilrdf.org.tw/resources
- Klokah vocabulary resources: https://web.klokah.tw/vocabulary/
