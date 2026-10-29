export class Queue<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  enqueue(element: T) {
    this.items.push(element);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  peek(): T | undefined {
    if (!this.isEmpty()) {
      return this.items[0];
    }
    return undefined;
  }

  size(): number {
    return this.items.length;
  }

  getItems(): T[] {
    return [...this.items]; // Return a copy to prevent direct mutation
  }
}
