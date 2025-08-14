import { DesignDoc, HistoryEntry } from './types';

export class HistoryManager {
  private history: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxEntries = 100;

  saveSnapshot(doc: DesignDoc): void {
    const snapshot = JSON.stringify(doc);
    const entry: HistoryEntry = {
      id: `history-${Date.now()}`,
      at: Date.now(),
      snapshot,
    };

    this.history.push(entry);
    
    // Limit history size
    if (this.history.length > this.maxEntries) {
      this.history.shift();
    }
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  undo(): DesignDoc | null {
    if (this.history.length <= 1) return null;
    
    const current = this.history.pop()!;
    this.redoStack.push(current);
    
    const previous = this.history[this.history.length - 1];
    return JSON.parse(previous.snapshot);
  }

  redo(): DesignDoc | null {
    if (this.redoStack.length === 0) return null;
    
    const next = this.redoStack.pop()!;
    this.history.push(next);
    
    return JSON.parse(next.snapshot);
  }

  canUndo(): boolean {
    return this.history.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.history = [];
    this.redoStack = [];
  }

  getHistoryLength(): number {
    return this.history.length;
  }
}