import 'reflect-metadata';
import type { Token } from './di/types';
import { Container } from './di/container';
import { getModuleMetadata, type ModuleMetadata } from './module';
import { buildRouter } from './http/router';
import type { RouteRecord } from './http/router';

type CreateResult = {
  container: Container;
  controllers: Token<any>[];
  providers: Token<any>[];
  router: RouteRecord[];
};

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function collectFromModule(
  moduleClass: Token<any>,
  visited: Set<Token<any>>,
  out: { controllers: Token<any>[]; providers: Token<any>[] },
) {
  if (visited.has(moduleClass)) return;
  visited.add(moduleClass);

  const meta: ModuleMetadata | undefined = getModuleMetadata(moduleClass);
  if (!meta) {
    throw new Error(
      `Cannot bootstrap: ${moduleClass.name} is not marked with @Module()`,
    );
  }

  const imports = meta.imports ?? [];
  for (const importedModule of imports) {
    collectFromModule(importedModule, visited, out);
  }

  out.controllers.push(...(meta.controllers ?? []));
  out.providers.push(...(meta.providers ?? []));
}

function ensureInjectableForControllers(controllers: Token<any>[]) {
  const KEY = 'mini-nest:injectable';

  for (const c of controllers) {
    const is = Reflect.getMetadata(KEY, c) === true;
    if (!is) {
      Reflect.defineMetadata(KEY, true, c);
    }
  }
}

export class NestFactory {
  static create(AppModule: Token<any>): CreateResult {
    const container = new Container();

    const bucket = {
      controllers: [] as Token<any>[],
      providers: [] as Token<any>[],
    };
    collectFromModule(AppModule, new Set(), bucket);

    const controllers = uniq(bucket.controllers);
    const providers = uniq(bucket.providers);

    ensureInjectableForControllers(controllers);

    const router = buildRouter(controllers);

    return {
      container,
      controllers,
      providers,
      router,
    };
  }
}
