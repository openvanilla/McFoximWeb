import { TW_01 } from './TW_01';
import { TW_02 } from './TW_02';
import { TW_03 } from './TW_03';
import { TW_04 } from './TW_04';
import { TW_05 } from './TW_05';
import { TW_06 } from './TW_06';
import { TW_07 } from './TW_07';
import { TW_08 } from './TW_08';
import { TW_09 } from './TW_09';
import { TW_10 } from './TW_10';
import { TW_11 } from './TW_11';
import { TW_13 } from './TW_13';
import { TW_14 } from './TW_14';
import { TW_15 } from './TW_15';
import { TW_16 } from './TW_16';
import { TW_17 } from './TW_17';
import { TW_18 } from './TW_18';
import { TW_19 } from './TW_19';
import { TW_20 } from './TW_20';
import { TW_21 } from './TW_21';
import { TW_22 } from './TW_22';
import { TW_23 } from './TW_23';
import { TW_24 } from './TW_24';
import { TW_25 } from './TW_25';
import { TW_26 } from './TW_26';
import { TW_27 } from './TW_27';
import { TW_28 } from './TW_28';
import { TW_29 } from './TW_29';
import { TW_30 } from './TW_30';
import { TW_31 } from './TW_31';
import { TW_32 } from './TW_32';
import { TW_33 } from './TW_33';
import { TW_34 } from './TW_34';
import { TW_35 } from './TW_35';
import { TW_36 } from './TW_36';
import { TW_37 } from './TW_37';
import { TW_38 } from './TW_38';
import { TW_39 } from './TW_39';
import { TW_40 } from './TW_40';
import { TW_41 } from './TW_41';
import { TW_42 } from './TW_42';

export interface InputTable {
  name: string;
  data: string[][];
}

export class InputTableManager {
  private static instance: InputTableManager;
  private internalIndex_: number = 0;

  private constructor() {}

  public static getInstance(): InputTableManager {
    if (!InputTableManager.instance) {
      InputTableManager.instance = new InputTableManager();
    }
    return InputTableManager.instance;
  }

  get currentTable(): InputTable {
    return this.tables[this.internalIndex_];
  }

  get selectedIndexValue(): number {
    return this.internalIndex_;
  }

  set selectedIndexValue(index: number) {
    if (index >= 0 && index < this.tables.length) {
      this.internalIndex_ = index;
    } else {
      throw new Error('Index out of bounds');
    }
  }

  get tableNames(): string[] {
    return this.tables.map((table) => table.name);
  }

  readonly tables: Array<InputTable> = [
    TW_01,
    TW_02,
    TW_03,
    TW_04,
    TW_05,
    TW_06,
    TW_07,
    TW_08,
    TW_09,
    TW_10,
    TW_11,
    TW_13,
    TW_14,
    TW_15,
    TW_16,
    TW_17,
    TW_18,
    TW_19,
    TW_20,
    TW_21,
    TW_22,
    TW_23,
    TW_24,
    TW_25,
    TW_26,
    TW_27,
    TW_28,
    TW_29,
    TW_30,
    TW_31,
    TW_32,
    TW_33,
    TW_34,
    TW_35,
    TW_36,
    TW_37,
    TW_38,
    TW_39,
    TW_40,
    TW_41,
    TW_42,
  ];
}
