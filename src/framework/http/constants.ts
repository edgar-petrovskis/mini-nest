export const METADATA_KEYS = {
  controllerPrefix: 'mini_nest:http:controller_prefix',
  routes: 'mini_nest:http:routes',
  routeParams: 'mini_nest:http:route_params',
  controllerPipes: 'mini_nest:http:controller_pipes',
  methodPipes: 'mini_nest:http:method_pipes',
  paramPipes: 'mini_nest:http:param_pipes',
  controllerGuards: 'mini_nest:http:controller_guards',
  methodGuards: 'mini_nest:http:method_guards',
  controllerInterceptors: 'mini_nest:http:controller_interceptors',
  methodInterceptors: 'mini_nest:http:method_interceptors',
  controllerFilters: 'mini_nest:http:controller_filters',
  methodFilters: 'mini_nest:http:method_filters',
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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

export type GuardContext = {
  request: unknown;
  controller: unknown;
  handlerName: string | symbol;
  args: unknown[];
};

export type GuardCanActivate = {
  canActivate(context: GuardContext): boolean | Promise<boolean>;
};

export type GuardToken =
  | GuardCanActivate
  | (new (...args: any[]) => GuardCanActivate);

export type InterceptorContext = {
  request: unknown;
  controller: unknown;
  handlerName: string | symbol;
  args: unknown[];
};

export type CallHandler = {
  handle: () => Promise<unknown>;
};

export type InterceptorTransform = {
  intercept(
    context: InterceptorContext,
    next: CallHandler,
  ): unknown | Promise<unknown>;
};

export type InterceptorToken =
  | InterceptorTransform
  | (new (...args: any[]) => InterceptorTransform);

export type FilterContext = {
  request: unknown;
  response: unknown;
  controller?: unknown;
  handlerName?: string | symbol;
};

export type FilterResult = {
  status: number;
  body: unknown;
  contentType?: 'json' | 'text';
};

export type ExceptionFilter = {
  catch(
    exception: unknown,
    context: FilterContext,
  ): FilterResult | void | Promise<FilterResult | void>;
};

export type FilterToken =
  | ExceptionFilter
  | (new (...args: any[]) => ExceptionFilter);
