export type Class<T = any> = new (...args: any[]) => T;

export type Token<T = any> = Class<T>;
