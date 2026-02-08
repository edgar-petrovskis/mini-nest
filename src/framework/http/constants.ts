export const METADATA_KEYS = {
  controllerPrefix: 'mini_nest:http:controller_prefix',
  routes: 'mini_nest:http:routes',
  routeParams: 'mini_nest:http:route_params',
};

export type HttpMethod = 'GET';

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handlerName: string | symbol;
};

export type RouteParamSource = 'param' | 'query' | 'body';

export type RouteParamDefinition = {
  index: number;
  source: RouteParamSource;
  name?: string;
};
