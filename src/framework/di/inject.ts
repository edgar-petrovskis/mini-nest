import 'reflect-metadata';
import { Token } from './types';

const INJECT_TOKENS_KEY = 'mini-nest:inject:tokens';

export function Inject(token?: Token): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    if (!token) return;

    const existing: Record<number, Token> =
      Reflect.getMetadata(INJECT_TOKENS_KEY, target) ?? {};

    existing[parameterIndex] = token;
    Reflect.defineMetadata(INJECT_TOKENS_KEY, existing, target);
  };
}

export function getInjectedTokens(target: Function): Record<number, Token> {
  return Reflect.getMetadata(INJECT_TOKENS_KEY, target) ?? {};
}
