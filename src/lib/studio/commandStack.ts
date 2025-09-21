// Command pattern implementation for undo/redo system

export interface Command {
  id: string;
  type: string;
  timestamp: number;
  execute(): void;
  undo(): void;
  redo(): void;
}

export interface StrokeData {
  id: string;
  color: string;
  size: number;
  opacity: number;
  points: { x: number; y: number; p?: number; t?: number }[];
}

export class AddStrokeCommand implements Command {
  id: string;
  type = 'addStroke';
  timestamp: number;
  
  constructor(
    private strokeData: StrokeData,
    private artworkCanvas: HTMLCanvasElement,
    private onExecute?: () => void,
    private onUndo?: () => void
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
  }
  
  execute(): void {
    // Rasterize stroke to canvas
    const ctx = this.artworkCanvas.getContext('2d')!;
    ctx.save();
    ctx.globalAlpha = this.strokeData.opacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = this.strokeData.color;
    ctx.lineWidth = this.strokeData.size;
    ctx.beginPath();
    
    for (let i = 0; i < this.strokeData.points.length; i++) {
      const p = this.strokeData.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
    
    this.onExecute?.();
  }
  
  undo(): void {
    // This would require maintaining canvas snapshots or vector data
    // For now, we'll trigger a canvas rebuild
    this.onUndo?.();
  }
  
  redo(): void {
    this.execute();
  }
}

export class EraseSegmentCommand implements Command {
  id: string;
  type = 'eraseSegment';
  timestamp: number;
  
  constructor(
    private eraseArea: { x: number; y: number; radius: number },
    private artworkCanvas: HTMLCanvasElement,
    private onExecute?: () => void,
    private onUndo?: () => void
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
  }
  
  execute(): void {
    const ctx = this.artworkCanvas.getContext('2d')!;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(this.eraseArea.x, this.eraseArea.y, this.eraseArea.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    this.onExecute?.();
  }
  
  undo(): void {
    this.onUndo?.();
  }
  
  redo(): void {
    this.execute();
  }
}

export class CommandStack {
  private commands: Command[] = [];
  private currentIndex = -1;
  private maxSize = 100;
  
  executeCommand(command: Command): void {
    // Remove any commands after current index (redo stack)
    this.commands = this.commands.slice(0, this.currentIndex + 1);
    
    // Add new command
    this.commands.push(command);
    this.currentIndex++;
    
    // Limit stack size
    if (this.commands.length > this.maxSize) {
      this.commands.shift();
      this.currentIndex--;
    }
    
    // Execute the command
    command.execute();
  }
  
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }
  
  undo(): void {
    if (this.canUndo()) {
      const command = this.commands[this.currentIndex];
      command.undo();
      this.currentIndex--;
    }
  }
  
  redo(): void {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.commands[this.currentIndex];
      command.redo();
    }
  }
  
  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
  }
  
  getHistory(): Command[] {
    return [...this.commands];
  }
}