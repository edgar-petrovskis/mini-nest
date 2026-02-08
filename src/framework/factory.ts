import 'reflect-metadata';
import type { Token } from './di/types';
import { Container } from './di/container';
import { getModuleMetadata, type ModuleMetadata } from './module';
import { buildRouter } from './http/router';
import type { RouteRecord } from './http/router';
import type { PipeToken } from './http/constants';
import { createExpressApp } from './http/express';

export type MiniNestApp = {
  container: Container;
  controllers: Token<any>[];
  providers: Token<any>[];
  router: RouteRecord[];
  useGlobalPipes: (...pipes: PipeToken[]) => void;
  listen: (port: number, callback?: () => void) => void;
};

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function collectControllersFromModule(
  moduleClass: Token<any>,
  visited: Set<Token<any>>,
  out: Token<any>[],
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
    collectControllersFromModule(importedModule, visited, out);
  }

  out.push(...(meta.controllers ?? []));
}

function collectVisibleProviders(
  moduleClass: Token<any>,
  cache: Map<Token<any>, Token<any>[]>,
): Token<any>[] {
  const cached = cache.get(moduleClass);
  if (cached) return cached;

  const meta: ModuleMetadata | undefined = getModuleMetadata(moduleClass);
  if (!meta) {
    throw new Error(
      `Cannot bootstrap: ${moduleClass.name} is not marked with @Module()`,
    );
  }

  const localProviders = meta.providers ?? [];
  const importedModules = meta.imports ?? [];

  const importedExports = importedModules.flatMap((importedModule) =>
    collectExportedProviders(importedModule, cache),
  );

  const visibleProviders = uniq([...localProviders, ...importedExports]);
  cache.set(moduleClass, visibleProviders);

  return visibleProviders;
}

function collectExportedProviders(
  moduleClass: Token<any>,
  cache: Map<Token<any>, Token<any>[]>,
): Token<any>[] {
  const meta: ModuleMetadata | undefined = getModuleMetadata(moduleClass);
  if (!meta) {
    throw new Error(
      `Cannot bootstrap: ${moduleClass.name} is not marked with @Module()`,
    );
  }

  const visibleProviders = collectVisibleProviders(moduleClass, cache);
  const requestedExports = meta.exports ?? [];

  for (const exportedToken of requestedExports) {
    if (!visibleProviders.includes(exportedToken)) {
      throw new Error(
        `Invalid export ${exportedToken.name} in ${moduleClass.name}: token is not available in this module scope`,
      );
    }
  }

  return uniq(requestedExports);
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
  static create(AppModule: Token<any>): MiniNestApp {
    const container = new Container();

    const rawControllers: Token<any>[] = [];
    collectControllersFromModule(AppModule, new Set(), rawControllers);
    const controllers = uniq(rawControllers);
    const providers = collectVisibleProviders(AppModule, new Map());

    ensureInjectableForControllers(controllers);

    const router = buildRouter(controllers);
    const globalPipes: PipeToken[] = [];
    const httpApp = createExpressApp(router, container, globalPipes);

    return {
      container,
      controllers,
      providers,
      router,
      useGlobalPipes: (...pipes: PipeToken[]) => {
        globalPipes.push(...pipes);
      },
      listen: (port: number, callback?: () => void) => {
        httpApp.listen(port, callback);
      },
    };
  }
}
