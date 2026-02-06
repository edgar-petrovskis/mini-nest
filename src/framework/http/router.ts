import {
  METADATA_KEYS,
  type RouteDefinition,
  type HttpMethod,
} from './constants';
import type { Token } from '../di/types';

export type RouteRecord = {
  method: HttpMethod;
  path: string;
  controllerToken: Token<any>;
  handlerName: string | symbol;
};

function joinPaths(prefix: string, path: string): string {
  const a = prefix === '/' ? '' : prefix;
  const b = path.startsWith('/') ? path : `/${path}`;
  const full = `${a}${b}`;
  return full === '' ? '/' : full;
}

export function buildRouter(controllers: Token<any>[]): RouteRecord[] {
  const records: RouteRecord[] = [];

  for (const ControllerClass of controllers) {
    const prefix: string =
      Reflect.getMetadata(METADATA_KEYS.controllerPrefix, ControllerClass) ??
      '';

    const routes: RouteDefinition[] =
      Reflect.getMetadata(METADATA_KEYS.routes, ControllerClass) ?? [];

    for (const r of routes) {
      records.push({
        method: r.method,
        path: joinPaths(prefix, r.path),
        controllerToken: ControllerClass,
        handlerName: r.handlerName,
      });
    }
  }

  return records;
}
