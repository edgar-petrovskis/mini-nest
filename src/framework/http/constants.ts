export const METADATA_KEYS = {
  controllerPrefix: 'mini_nest:http:controller_prefix',
  routes: 'mini_nest:http:routes',
};

export type HttpMethod = 'GET';

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handlerName: string;
};
