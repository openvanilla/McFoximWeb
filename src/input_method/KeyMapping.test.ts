import { KeyMapping } from './KeyMapping';
import { KeyName } from './Key';

describe('KeyMapping', () => {
  describe('keyFromKeyboardEvent', () => {
    it('should map arrow keys correctly', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.LEFT);
    });

    it('should map ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowRight' });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.RIGHT);
    });

    it('should map ArrowUp', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.UP);
    });

    it('should map ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.DOWN);
    });

    it('should map Home and End keys', () => {
      let event = new KeyboardEvent('keydown', { code: 'Home' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.HOME);

      event = new KeyboardEvent('keydown', { code: 'End' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.END);
    });

    it('should map Backspace and Delete', () => {
      let event = new KeyboardEvent('keydown', { code: 'Backspace' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.BACKSPACE);

      event = new KeyboardEvent('keydown', { code: 'Delete' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.DELETE);
    });

    it('should map Enter and NumpadEnter to RETURN', () => {
      let event = new KeyboardEvent('keydown', { code: 'Enter' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.RETURN);

      event = new KeyboardEvent('keydown', { code: 'NumpadEnter' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.RETURN);
    });

    it('should map Escape, Space, Tab', () => {
      let event = new KeyboardEvent('keydown', { code: 'Escape' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.ESC);

      event = new KeyboardEvent('keydown', { code: 'Space' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.SPACE);

      event = new KeyboardEvent('keydown', { code: 'Tab' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.TAB);
    });

    it('should map Page Up and Page Down', () => {
      let event = new KeyboardEvent('keydown', { code: 'PageUp' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.PAGE_UP);

      event = new KeyboardEvent('keydown', { code: 'PageDown' });
      expect(KeyMapping.keyFromKeyboardEvent(event).name).toBe(KeyName.PAGE_DOWN);
    });

    it('should map numpad operator keys', () => {
      const operators = [
        'NumpadAdd',
        'NumpadSubtract',
        'NumpadMultiply',
        'NumpadDivide',
        'NumpadDecimal',
      ];
      operators.forEach((op) => {
        const event = new KeyboardEvent('keydown', { code: op });
        const key = KeyMapping.keyFromKeyboardEvent(event);
        expect(key.name).toBe(KeyName.ASCII);
        expect(key.isNumpadKey).toBe(true);
      });
    });

    it('should map numpad digits', () => {
      for (let i = 0; i <= 9; i++) {
        const event = new KeyboardEvent('keydown', { code: `Numpad${i}`, key: `${i}` });
        const key = KeyMapping.keyFromKeyboardEvent(event);
        expect(key.name).toBe(KeyName.ASCII);
        expect(key.isNumpadKey).toBe(true);
      }
    });

    it('should respect modifier keys', () => {
      const event = new KeyboardEvent('keydown', { code: 'Space', shiftKey: true, ctrlKey: true });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.shiftPressed).toBe(true);
      expect(key.ctrlPressed).toBe(true);
    });

    it('should map unknown codes to UNKNOWN', () => {
      const event = new KeyboardEvent('keydown', { code: 'UnknownCode' });
      const key = KeyMapping.keyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.UNKNOWN);
    });
  });

  it('should map numpad arrow keys when NumLock is off', () => {
    const arrowCodes = [
      { code: 'Numpad8', key: 'ArrowUp', expected: KeyName.UP },
      { code: 'Numpad2', key: 'ArrowDown', expected: KeyName.DOWN },
      { code: 'Numpad4', key: 'ArrowLeft', expected: KeyName.LEFT },
      { code: 'Numpad6', key: 'ArrowRight', expected: KeyName.RIGHT },
      { code: 'Numpad7', key: 'Home', expected: KeyName.HOME },
      { code: 'Numpad1', key: 'End', expected: KeyName.END },
      { code: 'Numpad9', key: 'PageUp', expected: KeyName.PAGE_UP },
      { code: 'Numpad3', key: 'PageDown', expected: KeyName.PAGE_DOWN },
    ];

    arrowCodes.forEach(({ code, key, expected }) => {
      const event = new KeyboardEvent('keydown', { code, key });
      const result = KeyMapping.keyFromKeyboardEvent(event);
      expect(result.name).toBe(expected);
      expect(result.isNumpadKey).toBe(false);
    });
  });
});
