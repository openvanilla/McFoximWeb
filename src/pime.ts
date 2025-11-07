/**
 * @license
 * Copyright (c) 2022 and onwards The McFoxIM Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputController } from './input_method';
import { InputTableManager } from './data';
import { InputUI } from './input_method/InputUI';
import { KeyFromKeyboardEvent, VK_Keys } from './pime_keys';
import path from 'path';
import fs from 'fs';
import process from 'process';
import child_process from 'child_process';

interface Settings {
  selected_input_table_index: number;
  candidate_font_size: number;
}

/**
 * A middle data structure between McFoxim input controller and PIME.
 * @interface
 */
interface UiState {
  /** The string to be committed. */
  commitString: string;
  /** The composition string. */
  compositionString: string;
  /** The cursor position in the composition string. */
  compositionCursor: number;
  /** Whether to show the candidate window. */
  showCandidates: boolean;
  /** The list of candidates. */
  candidateList: string[];
  /** The cursor position in the candidate list. */
  candidateCursor: number;
  /** The message to be shown. */
  showMessage: any;
  /** Whether to hide the message. */
  hideMessage: boolean;
}

/**  The default settings. */
const defaultSettings: Settings = {
  selected_input_table_index: 0,
  candidate_font_size: 16,
};

/**
 * The commands for PIME McFoxim.
 * @enum
 */
enum PimeMcFoximCommand {
  ModeIcon = 0,
  SwitchLanguage = 1,
  OpenHomepage = 2,
  OpenBugReport = 3,
  OpenOptions = 4,
  Help = 10,
}

/** Wraps InputController and required states.  */
class PimeMcFoxim {
  /** The input controller. */
  readonly inputController: InputController;
  /** The UI state. */
  uiState: UiState = {
    commitString: '',
    compositionString: '',
    compositionCursor: 0,
    showCandidates: false,
    candidateList: [],
    candidateCursor: 0,
    showMessage: {},
    hideMessage: true,
  };
  settings: Settings = defaultSettings;
  constructor() {
    this.inputController = new InputController(this.makeUI(this));
    this.inputController.onError = () => {};
  }

  /** Resets the UI state before handling a key. */
  public resetBeforeHandlingKey(): void {
    this.uiState = {
      commitString: '',
      compositionString: '',
      compositionCursor: 0,
      showCandidates: false,
      candidateList: [],
      candidateCursor: 0,
      showMessage: {},
      hideMessage: true,
    };
  }

  /** Resets the input controller. */
  public resetController(): void {
    this.inputController.reset();
  }

  /** Applies the settings to the input controller. */
  public applySettings(): void {
    let selectedTableIndex = this.settings.selected_input_table_index;
    InputTableManager.getInstance().selectedIndexValue = selectedTableIndex;
  }

  readonly pimeUserDataPath: string = path.join(process.env.APPDATA || '', 'PIME');
  readonly mcfoximUserDataPath: string = path.join(this.pimeUserDataPath, 'mcfoxim');
  readonly userSettingsPath: string = path.join(this.mcfoximUserDataPath, 'config.json');

  isOpened: boolean = true;
  lastRequest: any = {};
  isLastFilterKeyDownHandled: boolean = false;
  isCapsLockHold: boolean = false;

  /** Whether the button has been added to the UI. */
  alreadyAddButton: boolean = false;
  /** Whether the OS is Windows 8 or above. */
  isWindows8Above: boolean = false;

  /**
   * Load settings from disk.
   * @param callback The callback function.
   */
  public loadSettings(callback: () => void): void {
    fs.readFile(this.userSettingsPath, (err, data) => {
      if (err) {
        console.log('Unable to read user settings from ' + this.userSettingsPath);
        this.writeSettings();
        return;
      }
      console.log(data);
      try {
        console.log('Try to load settings');
        let newSettings = JSON.parse(data.toString());
        this.settings = Object.assign({}, defaultSettings, newSettings);
        console.log('Loaded settings: ' + JSON.stringify(this.settings, null, 2));
        this.applySettings();
      } catch {
        console.error('Failed to parse settings');
        this.writeSettings();
      }
    });
  }

  /** Write settings to disk */
  public writeSettings() {
    if (!fs.existsSync(this.mcfoximUserDataPath)) {
      console.log('User data folder not found, creating ' + this.mcfoximUserDataPath);
      console.log('Creating one');
      fs.mkdirSync(this.mcfoximUserDataPath);
    }

    console.log('Writing user settings to ' + this.userSettingsPath);
    let string = JSON.stringify(this.settings, null, 2);
    fs.writeFile(this.userSettingsPath, string, (err) => {
      if (err) {
        console.error('Failed to write settings');
        console.error(err);
      }
    });
  }

  /**
   * Creates an InputUI object.
   * @param instance The PimeMcFoxim instance.
   * @returns The InputUI object.
   */
  public makeUI(instance: PimeMcFoxim): InputUI {
    let that: InputUI = {
      reset: () => {
        let commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      commitString(text: string) {
        console.log('commitString: ' + text);
        let joinedCommitString = instance.uiState.compositionString + text;
        console.log('joinedCommitString: ' + joinedCommitString);
        instance.uiState = {
          commitString: joinedCommitString,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      update(stateString: string) {
        let state = JSON.parse(stateString);
        let composingBuffer = state.composingBuffer;
        let candidates = state.candidates;
        let selectedIndex = 0;
        let index = 0;
        let candidateList = [];
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            selectedIndex = index;
          }
          let joined = candidate.candidate.text + ' - ' + candidate.candidate.description;
          candidateList.push(joined);
          index++;
        }

        // Note: McFoxim's composing buffer are composed by segments so
        // it allows an input method framework to draw underlines
        let compositionString = '';
        for (let item of composingBuffer) {
          compositionString += item.text;
        }

        let tooltip = state.tooltip;
        let showMessage = {};
        let hideMessage = true;
        if (tooltip) {
          showMessage = { message: tooltip, duration: 3 };
          hideMessage = false;
        }
        let commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: compositionString,
          compositionCursor: state.cursorIndex,
          showCandidates: candidates.length > 0,
          candidateList: candidateList,
          candidateCursor: selectedIndex,
          showMessage: showMessage,
          hideMessage: hideMessage,
        };
      },
    };
    return that;
  }

  /**
   * Creates the button UI response.
   * @returns The button UI response.
   */
  public buttonUiResponse(): any {
    let windowsModeIcon = this.isOpened ? 'eng.ico' : 'close.ico';
    let windowsModeIconPath = path.join(__dirname, 'icons', windowsModeIcon);
    let settingsIconPath = path.join(__dirname, 'icons', 'config.ico');
    let object: any = {};
    let changeButton: any[] = [];
    if (this.isWindows8Above) {
      changeButton.push({ icon: windowsModeIconPath, id: 'windows-mode-icon' });
    }
    changeButton.push({ icon: windowsModeIconPath, id: 'switch-lang' });
    object.changeButton = changeButton;

    if (!this.alreadyAddButton) {
      let addButton: any[] = [];
      if (this.isWindows8Above) {
        addButton.push({
          id: 'windows-mode-icon',
          icon: windowsModeIconPath,
          commandId: PimeMcFoximCommand.ModeIcon,
          tooltip: '輸入模式切換',
        });
      }

      addButton.push({
        id: 'switch-lang',
        icon: windowsModeIconPath,
        commandId: PimeMcFoximCommand.SwitchLanguage,
        tooltip: '輸入模式切換',
      });
      addButton.push({
        id: 'settings',
        icon: settingsIconPath,
        type: 'menu',
        tooltip: '設定',
      });
      object.addButton = addButton;
      this.alreadyAddButton = true;
    }
    return object;
  }

  /**
   * Creates the custom UI response.
   * @returns The custom UI response.
   */
  public customUiResponse(): any {
    let fontSize = this.settings.candidate_font_size;
    if (fontSize == undefined) {
      fontSize = 16;
    } else if (fontSize < 10) {
      fontSize = 10;
    } else if (fontSize > 32) {
      fontSize = 32;
    }

    return {
      openKeyboard: this.isOpened,
      customizeUI: {
        candPerRow: 1,
        candFontSize: fontSize,
        candFontName: 'Microsoft YaHei',
        candUseCursor: true,
      },
      setSelKeys: '123456789',
      keyboardOpen: this.isOpened,
    };
  }

  /**
   * Handles a command.
   * @param id The command ID.
   */
  public handleCommand(id: PimeMcFoximCommand): void {
    switch (id) {
      case PimeMcFoximCommand.ModeIcon:
        break;
      case PimeMcFoximCommand.SwitchLanguage:
        break;
      case PimeMcFoximCommand.OpenHomepage:
        {
          let url = 'https://mcfoxim.openvanilla.org/';
          let command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      case PimeMcFoximCommand.OpenBugReport:
        {
          let url = 'https://github.com/openvanilla/McFoximWeb/issues';
          let command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      case PimeMcFoximCommand.OpenOptions:
        {
          let python3 = path.join(__dirname, '..', '..', '..', 'python', 'python3', 'python.exe');
          let script = path.join(__dirname, 'config_tool.py');
          let command = `"${python3}" "${script}"`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;

      case PimeMcFoximCommand.Help:
        {
          let python3 = path.join(__dirname, '..', '..', '..', 'python', 'python3', 'python.exe');
          const script = path.join(__dirname, 'config_tool.py');
          const command = `"${python3}" "${script}" help`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      default:
        break;
    }
  }
}

const pimeMcFoxim = new PimeMcFoxim();

try {
  if (!fs.existsSync(pimeMcFoxim.userSettingsPath)) {
    fs.writeFileSync(pimeMcFoxim.userSettingsPath, JSON.stringify(defaultSettings));
  }

  fs.watch(pimeMcFoxim.userSettingsPath, (event, filename) => {
    if (filename) {
      pimeMcFoxim.loadSettings(() => {});
    }
  });
} catch (e) {
  console.error(e);
}

module.exports = {
  textReducer(_: any, preState: any) {
    // Note: textReducer and response are the pattern of NIME. Actually, PIME
    // only care about the response. Since we let pimeMcFoxim to do
    // everything, we just left textReducer as an empty implementation to let
    // NIME to call it.
    return preState;
  },

  response(request: any, _: any) {
    const lastRequest = pimeMcFoxim.lastRequest;
    pimeMcFoxim.lastRequest = request;
    const responseTemplate = {
      return: false,
      success: true,
      seqNum: request.seqNum,
    };
    if (request.method === 'init') {
      const { isWindows8Above } = request;
      pimeMcFoxim.isWindows8Above = isWindows8Above;
      const customUi = pimeMcFoxim.customUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, {
        removeButton: ['settings'],
      });
      return response;
    }
    if (request.method === 'close') {
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['settings'],
      });
      pimeMcFoxim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onActivate') {
      const customUi = pimeMcFoxim.customUiResponse();
      const buttonUi = pimeMcFoxim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onDeactivate') {
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      pimeMcFoxim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onPreservedKey') {
      console.log(request);
      const response = Object.assign({}, responseTemplate);
      return response;
    }

    if (request.method === 'filterKeyUp') {
      let handled = this.pimeMcFoxim.isLastFilterKeyDownHandled;
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyUp' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: handled,
        });
        return response;
      }
      // Single Shift to toggle alphabet mode.
      const response = Object.assign({}, responseTemplate, { return: handled });
      return response;
    }

    if (request.method === 'filterKeyDown') {
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key down event.
        // We should ignore such events.
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }

      const { keyCode, charCode, keyStates } = request;

      if ((keyStates[VK_Keys.VK_CAPITAL] & 1) != 0) {
        // Ignores caps lock.
        pimeMcFoxim.resetController();
        pimeMcFoxim.isCapsLockHold = true;
        pimeMcFoxim.isLastFilterKeyDownHandled = false;
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      } else {
        pimeMcFoxim.isCapsLockHold = false;
      }

      const key = KeyFromKeyboardEvent(keyCode, keyStates, String.fromCharCode(charCode), charCode);
      pimeMcFoxim.resetBeforeHandlingKey();

      if (key.ctrlPressed) {
        pimeMcFoxim.resetController();
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      const handled = pimeMcFoxim.inputController.handle(key);
      pimeMcFoxim.isLastFilterKeyDownHandled = handled;
      const response = Object.assign({}, responseTemplate, {
        return: handled,
      });
      this.isKeyDownHandled = handled;
      return response;
    }

    if (request.method === 'onKeyDown') {
      // Ignore caps lock.
      if (pimeMcFoxim.isCapsLockHold) {
        pimeMcFoxim.resetController();
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      if (
        lastRequest &&
        lastRequest.method === 'onKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      const uiState: any = pimeMcFoxim.uiState;
      let response = Object.assign({}, responseTemplate, uiState, {
        return: pimeMcFoxim.isLastFilterKeyDownHandled,
      });
      return response;
    }

    if (request.method === 'onKeyboardStatusChanged') {
      const { opened } = request;
      pimeMcFoxim.isOpened = opened;
      pimeMcFoxim.resetController();
      const customUi = pimeMcFoxim.customUiResponse();
      const buttonUi = pimeMcFoxim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onCompositionTerminated') {
      pimeMcFoxim.resetController();
      const uiState = pimeMcFoxim.uiState;
      const customUi = pimeMcFoxim.customUiResponse();
      const buttonUi = pimeMcFoxim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, uiState, customUi, buttonUi);
      pimeMcFoxim.resetBeforeHandlingKey();
      return response;
    }

    if (request.method === 'onCommand') {
      const { id } = request;
      pimeMcFoxim.handleCommand(id);
      const uiState = pimeMcFoxim.uiState;
      const customUi = pimeMcFoxim.customUiResponse();
      const buttonUi = pimeMcFoxim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, uiState, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onMenu') {
      const menu = [
        {
          text: '小麥注音輸入法網站',
          id: PimeMcFoximCommand.OpenHomepage,
        },
        {
          text: '問題回報',
          id: PimeMcFoximCommand.OpenBugReport,
        },
        {
          text: '輔助說明',
          id: PimeMcFoximCommand.Help,
        },

        {},
        {
          text: '偏好設定 (&O)',
          id: PimeMcFoximCommand.OpenOptions,
        },
      ];
      const response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
