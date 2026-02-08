export const METADATA_KEYS = {
  controllerPrefix: 'mini_nest:http:controller_prefix',
  routes: 'mini_nest:http:routes',
  routeParams: 'mini_nest:http:route_params',
  controllerPipes: 'mini_nest:http:controller_pipes',
  methodPipes: 'mini_nest:http:method_pipes',
  paramPipes: 'mini_nest:http:param_pipes',
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

export type PipeMetadata = {
  type: RouteParamSource;
  data?: string;
};

export type PipeTransform = {
  transform(value: unknown, metadata: PipeMetadata): unknown | Promise<unknown>;
};

export type PipeToken = PipeTransform | (new (...args: any[]) => PipeTransform);

export type ParamPipeDefinition = {
  index: number;
  pipes: PipeToken[];
};
