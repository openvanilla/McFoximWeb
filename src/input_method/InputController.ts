import { InputTableManager } from '../data';
import Completer from '../engine/Completer';
import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { InputUI } from './InputUI';
import { InputUIStateBuilder } from './InputUIElements';
import { Key } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';

export class InputController {
  private state_: InputState = new EmptyState();
  private keyHandler_: KeyHandler = new KeyHandler(
    new Completer(() => InputTableManager.getInstance().currentTable),
  );
  private ui_: InputUI;

  onError: () => void = () => {};

  constructor(ui: InputUI) {
    this.ui_ = ui;
  }

  reset(): void {
    const oldState = this.state_;
    if (oldState instanceof InputtingState) {
      if (oldState.composingBuffer.length > 0) {
        this.ui_.commitString(oldState.composingBuffer);
      }
    }
    this.enterState(this.state_, new EmptyState());
  }

  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = KeyMapping.keyFromKeyboardEvent(event);
    return this.handle(key);
  }

  handle(key: Key): boolean {
    const handled = this.keyHandler_.handle(
      key,
      this.state_,
      (state) => this.enterState(this.state_, state),
      () => this.onError(),
    );
    return handled;
  }

  private enterState(oldState: InputState, newState: InputState): void {
    if (newState instanceof EmptyState) {
      this.handleEmptyState(oldState, newState);
    } else if (newState instanceof CommittingState) {
      this.handleCommittingState(oldState, newState);
    } else if (newState instanceof InputtingState) {
      this.handleInputtingState(oldState, newState);
    }
  }

  private handleEmptyState(oldState: InputState, newState: EmptyState): void {
    this.ui_.reset();
    this.state_ = newState;
  }

  private handleCommittingState(oldState: InputState, newState: CommittingState): void {
    this.ui_.commitString(newState.commitString);
    this.ui_.reset();
    this.state_ = new EmptyState();
  }

  private handleInputtingState(oldState: InputState, newState: InputtingState): void {
    const builder = new InputUIStateBuilder(newState);
    const uiState = builder.buildJsonString();
    this.ui_.reset();
    this.ui_.update(uiState);
    this.state_ = newState;
  }
}
