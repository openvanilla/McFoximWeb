/**
 * @license
 * Copyright (c) 2022 and onwards The mcnative Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputTableManager } from './data';
import { InputController } from './input_method';
import { Key, KeyName } from './input_method/Key';

/**
 * Represents the settings for the mcnative IME on ChromeOS.
 */
type ChromeMcNativeSettings = {
  selected_input_table_index: number;
  hidden_table_indices: number[];
};

/**
 * The main class for the mcnative IME on ChromeOS.
 */
class ChromeMcNative {
  // The ID of the current input engine.
  engineID: string | undefined = undefined;

  // The current input context.
  context: chrome.input.ime.InputContext | undefined = undefined;

  // The default settings.
  readonly defaultSettings: ChromeMcNativeSettings = {
    selected_input_table_index: 0,
    hidden_table_indices: [],
  };
  settings: ChromeMcNativeSettings = {
    selected_input_table_index: 0,
    hidden_table_indices: [],
  };
  inputController: InputController;

  constructor() {
    // chrome.i18n.getAcceptLanguages((langs) => {});
    this.inputController = new InputController(this.makeUI());
    this.inputController.onError = () => {};
  }

  /**
   * Loads the settings from chrome.storage.sync.
   */
  loadSettings() {
    chrome.storage.sync.get('settings', (value) => {
      this.settings = value.settings;
      const selected_input_table_index = this.settings.selected_input_table_index;
      if (selected_input_table_index !== undefined) {
        InputTableManager.getInstance().selectedIndexValue = selected_input_table_index;
      }
    });
  }

  saveSettings() {
    chrome.storage.sync.set({ settings: this.settings });
  }

  /**
   * Updates the menu items.
   */
  updateMenu() {
    if (this.engineID === undefined) return;
    let menus: chrome.input.ime.MenuItem[] = [
      {
        id: 'mcnative-options',
        label: chrome.i18n.getMessage('menuOptions'),
        style: 'check' as const,
      },
      {
        id: 'mcnative-help',
        label: chrome.i18n.getMessage('menuHelp'),
        style: 'check' as const,
      },
      {
        id: 'mcnative-separator-1',
        label: '',
        style: 'separator' as const,
      },
    ];

    const selectedIndex = this.settings.selected_input_table_index || 0;
    const hiddenTableIndices = this.settings.hidden_table_indices || [];
    const inputTables = InputTableManager.getInstance().tableNames;
    let selectedTableSet = false;

    let inputTableMenus: chrome.input.ime.MenuItem[] = [];

    for (let i = 0; i < inputTables.length; i++) {
      if (hiddenTableIndices.includes(i)) {
        continue;
      }
      const tableName = inputTables[i];
      const checked = i === selectedIndex;
      if (checked) {
        selectedTableSet = true;
      }
      const item = {
        id: `mcnative-select-table-${i}`,
        label: tableName,
        style: 'check' as const,
        checked: checked,
      };
      inputTableMenus.push(item);
    }
    if (inputTableMenus.length === 0) {
      const tableName = inputTables[0];
      const item = {
        id: `mcnative-select-table-0`,
        label: tableName,
        style: 'check' as const,
        checked: true,
      };
      inputTableMenus.push(item);
      InputTableManager.getInstance().selectedIndexValue = 0;
      this.settings.selected_input_table_index = 0;
    } else if (!selectedTableSet) {
      let item = inputTableMenus[0];
      let id = item.id.split('-').pop();
      item.checked = true;
      InputTableManager.getInstance().selectedIndexValue = Number(id);
      this.settings.selected_input_table_index = Number(id);
    }

    menus = menus.concat(inputTableMenus);
    chrome.input.ime.setMenuItems({ engineID: this.engineID, items: menus });
  }

  tryOpen(url: string) {
    chrome.windows.getCurrent({}, (win) => {
      if (win === undefined) {
        chrome.windows.create({ url: url, focused: true });
        return;
      }

      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }

        const tabId = tabs[0].id;
        if (tabId !== undefined) {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    });
  }

  deferredResetTimeout?: NodeJS.Timeout | null = null;

  // Sometimes onBlur is called unexpectedly. It might be called and then a
  // onFocus comes suddenly when a user is typing contents continuously. Such
  // behaviour causes the input to be interrupted.
  //
  // To prevent the issue, we ignore such event if an onFocus comes very quickly.
  deferredReset() {
    if (this.deferredResetTimeout != null) {
      clearTimeout(this.deferredResetTimeout);
      this.deferredResetTimeout = null;
    }

    this.deferredResetTimeout = setTimeout(() => {
      this.inputController.reset();
      this.deferredResetTimeout = null;
    }, 5000);
  }

  /**
   * Creates the UI object for the input controller.
   * @returns The UI object.
   */
  makeUI() {
    return {
      reset: () => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;
        try {
          // The context might be destroyed by the time we reset it, so we use a
          // try/catch block here.
          chrome.input.ime.clearComposition({
            contextID: this.context.contextID,
          });
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        } catch (e) {}
      },

      commitString: (text: string) => {
        if (this.context === undefined) return;
        chrome.input.ime.commitText({
          contextID: this.context.contextID,
          text: text,
        });
      },

      update: (stateString: string) => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;

        const state = JSON.parse(stateString);
        const buffer = state.composingBuffer;
        const candidates = state.candidates;

        const segments = [];
        let text = '';
        let selectionStart: number | undefined = undefined;
        let selectionEnd: number | undefined = undefined;
        let index = 0;
        for (let item of buffer) {
          text += item.text;
          if (item.style === 'highlighted') {
            selectionStart = index;
            selectionEnd = index + item.text.length;
            let segment = {
              start: index,
              end: index + item.text.length,
              style: 'doubleUnderline' as const,
            };
            segments.push(segment);
          } else {
            let segment = {
              start: index,
              end: index + item.text.length,
              style: 'underline' as const,
            };
            segments.push(segment);
          }
          index += item.text.length;
        }

        // This shall not happen, but we make sure the cursor index to be not
        // larger than the text length.
        let localCursorIndex = state.cursorIndex;
        if (localCursorIndex > text.length) {
          localCursorIndex = text.length;
        }

        chrome.input.ime.setComposition({
          contextID: this.context.contextID,
          cursor: localCursorIndex,
          segments: segments,
          text: text,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });

        if (candidates.length) {
          let chromeCandidates = [];
          let index = 0;
          let selectedIndex = 0;
          for (let candidate of state.candidates) {
            if (candidate.selected) {
              selectedIndex = index;
            }
            let item = {
              candidate: candidate.candidate.text,
              annotation: candidate.candidate.description,
              id: index++,
              label: candidate.keyCap,
            };
            chromeCandidates.push(item);
          }

          const candidatePageCount = state.candidatePageCount;
          const candidatePageIndex = state.candidatePageIndex;
          const auxiliaryText = candidatePageIndex + '/' + candidatePageCount;

          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: auxiliaryText,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: true,
              vertical: true,
              pageSize: candidates.length,
            },
          });

          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: chromeCandidates,
          });

          chrome.input.ime.setCursorPosition({
            contextID: this.context.contextID,
            candidateID: selectedIndex,
          });
        } else {
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        }
      },
    };
  }
}

let chromeMcNative = new ChromeMcNative();

chrome.input?.ime.onActivate.addListener((engineID) => {
  chromeMcNative.engineID = engineID;
  chromeMcNative.loadSettings();
  chromeMcNative.updateMenu();
});

// Called when the current text input are loses the focus.
chrome.input?.ime.onBlur.addListener((context) => {
  chromeMcNative.deferredReset();
});

chrome.input?.ime.onReset.addListener((context) => {
  chromeMcNative.deferredReset();
});

// Called when the user switch to another input method.
chrome.input?.ime.onDeactivated.addListener((context) => {
  if (chromeMcNative.deferredResetTimeout != null) {
    clearTimeout(chromeMcNative.deferredResetTimeout);
  }
  chromeMcNative.context = undefined;
  chromeMcNative.inputController.reset();
  chromeMcNative.deferredResetTimeout = null;
});

// Called when the current text input is focused. We reload the settings this
// time.
chrome.input?.ime.onFocus.addListener((context) => {
  chromeMcNative.context = context;
  if (chromeMcNative.deferredResetTimeout != null) {
    clearTimeout(chromeMcNative.deferredResetTimeout);
  } else {
    chromeMcNative.loadSettings();
  }
});

// The main keyboard event handler.
chrome.input?.ime.onKeyEvent.addListener((engineID, keyData) => {
  chromeMcNative.engineID = engineID;
  if (keyData.type != 'keydown') {
    return false;
  }

  // We always prevent handling Ctrl + Space so we can switch input methods.
  if (keyData.ctrlKey && keyData.code === 'Space') {
    chromeMcNative.inputController.reset();
    return false;
  }

  if (keyData.altKey || keyData.altgrKey || keyData.capsLock) {
    return false;
  }

  const keyEvent = KeyFromKeyboardEvent(keyData);
  return chromeMcNative.inputController.handle(keyEvent);
});

chrome.input?.ime.onMenuItemActivated.addListener((engineID, name) => {
  switch (name) {
    case 'mcnative-options':
      chromeMcNative.tryOpen(chrome.runtime.getURL('options.html'));
      break;
    case 'mcnative-user-phrase':
      chromeMcNative.tryOpen(chrome.runtime.getURL('user_phrase.html'));
      break;
    case 'mcnative-help':
      chromeMcNative.tryOpen(chrome.runtime.getURL('help/index.html'));
      break;
    case 'mcnative-homepage':
      chromeMcNative.tryOpen('https://openvanilla.org/');
      break;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);

  if (request.command === 'get_table_names_and_settings') {
    const tableNames = InputTableManager.getInstance().tableNames;
    const hiddenTableIndices = chromeMcNative.settings.hidden_table_indices;
    sendResponse({ status: 'ok', tableNames, hiddenTableIndices });
  }

  if (request.command === 'set_table_hidden') {
    const tableIndex: number = request.tableIndex;
    const hidden: boolean = request.hidden;
    let hiddenTableIndices = chromeMcNative.settings.hidden_table_indices;
    if (hidden) {
      if (!hiddenTableIndices.includes(tableIndex)) {
        hiddenTableIndices.push(tableIndex);
      }
    } else {
      hiddenTableIndices = hiddenTableIndices.filter((index) => index !== tableIndex);
    }
    chromeMcNative.settings.hidden_table_indices = hiddenTableIndices;
    chromeMcNative.saveSettings();
    sendResponse({ status: 'ok' });
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

// A workaround to prevent Chrome to kill the service worker.
let lifeline: chrome.runtime.Port | undefined = undefined;

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = undefined;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      const args = {
        target: { tabId: tab.id ?? 9 },
        func: () => chrome.runtime.connect({ name: 'keepAlive' }),
      };
      await chrome.scripting.executeScript(args);
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(
  tabId: number,
  info: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab,
) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

keepAlive();

/**
 * Converts a keyboard event to a Key object.
 * @param event The keyboard event.
 * @returns The Key object.
 */
function KeyFromKeyboardEvent(event: chrome.input.ime.KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case 'ArrowLeft':
      keyName = KeyName.LEFT;
      break;
    case 'ArrowRight':
      keyName = KeyName.RIGHT;
      break;
    case 'ArrowUp':
      keyName = KeyName.UP;
      break;
    case 'ArrowDown':
      keyName = KeyName.DOWN;
      break;
    case 'Home':
      keyName = KeyName.HOME;
      break;
    case 'End':
      keyName = KeyName.END;
      break;
    case 'Backspace':
      keyName = KeyName.BACKSPACE;
      break;
    case 'Delete':
      keyName = KeyName.DELETE;
      break;
    case 'Enter':
      keyName = KeyName.RETURN;
      break;
    case 'Escape':
      keyName = KeyName.ESC;
      break;
    case 'Space':
      keyName = KeyName.SPACE;
      break;
    case 'Tab':
      keyName = KeyName.TAB;
      break;
    case 'PageUp':
      keyName = KeyName.PAGE_UP;
      break;
    case 'PageDown':
      keyName = KeyName.PAGE_DOWN;
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  const key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
