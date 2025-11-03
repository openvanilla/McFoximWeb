import { InputTableManager, InputTable } from './index';

describe('InputTableManager', () => {
  let manager: InputTableManager;

  beforeEach(() => {
    manager = InputTableManager.getInstance();
    manager.selectedIndexValue = 0;
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = InputTableManager.getInstance();
      const instance2 = InputTableManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('currentTable', () => {
    it('should return the table at the current index', () => {
      const table = manager.currentTable;
      expect(table).toBeDefined();
      expect(table).toHaveProperty('name');
      expect(table).toHaveProperty('data');
    });

    it('should return different tables when index changes', () => {
      const table0 = manager.currentTable;
      manager.selectedIndexValue = 1;
      const table1 = manager.currentTable;
      expect(table0).not.toBe(table1);
    });
  });

  describe('selectedIndexValue', () => {
    it('should get the current index', () => {
      manager.selectedIndexValue = 5;
      expect(manager.selectedIndexValue).toBe(5);
    });

    it('should set a valid index', () => {
      manager.selectedIndexValue = 10;
      expect(manager.selectedIndexValue).toBe(10);
    });

    it('should throw error for negative index', () => {
      expect(() => {
        manager.selectedIndexValue = -1;
      }).toThrow('Index out of bounds');
    });

    it('should throw error for index >= tables length', () => {
      expect(() => {
        manager.selectedIndexValue = manager.tables.length;
      }).toThrow('Index out of bounds');
    });
  });

  describe('tables', () => {
    it('should contain all imported tables', () => {
      expect(manager.tables.length).toBe(42);
    });

    it('each table should have required properties', () => {
      manager.tables.forEach((table: InputTable) => {
        expect(table).toHaveProperty('name');
        expect(table).toHaveProperty('data');
        expect(typeof table.name).toBe('string');
        expect(Array.isArray(table.data)).toBe(true);
      });
    });
  });
});
