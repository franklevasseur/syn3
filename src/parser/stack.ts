export class Stack<T> {
  private stack: T[];

  constructor() {
    this.stack = [];
  }

  public push(item: T) {
    this.stack.push(item);
  }

  public pop(): T | undefined {
    return this.stack.pop();
  }

  public peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  public get length() {
    return this.stack.length;
  }
}
