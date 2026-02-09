import 'reflect-metadata';
import { Token } from './types';
import { isInjectable } from './injectable';
import { getInjectedTokens } from './inject';

export class Container {
  private readonly singletons = new Map<Token<any>, any>();

  resolve<T>(token: Token<T>): T {
    if (!isInjectable(token)) {
      throw new Error(
        `Cannot resolve ${token.name}: class is not marked with @Injectable()`,
      );
    }

    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    const paramTypes: Token[] =
      Reflect.getMetadata('design:paramtypes', token) ?? [];

    const injectedTokens = getInjectedTokens(token);

    const deps = paramTypes.map((paramType, index) => {
      const overrideToken = injectedTokens[index];
      return this.resolve(overrideToken ?? paramType);
    });

    const instance = new token(...deps);
    this.singletons.set(token, instance);

    return instance;
  }
}
