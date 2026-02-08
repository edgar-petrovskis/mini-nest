import type {
  CallHandler,
  InterceptorContext,
  InterceptorToken,
} from '../constants';

function instantiateInterceptor(interceptor: InterceptorToken) {
  if (typeof interceptor === 'function') {
    return new interceptor();
  }
  return interceptor;
}

export async function runInterceptorChain(
  interceptors: InterceptorToken[],
  context: InterceptorContext,
  finalHandler: () => Promise<unknown>,
): Promise<unknown> {
  let next: CallHandler = {
    handle: finalHandler,
  };

  for (let i = interceptors.length - 1; i >= 0; i--) {
    const current = instantiateInterceptor(interceptors[i]);
    const prevNext = next;
    next = {
      handle: async () => current.intercept(context, prevNext),
    };
  }

  return next.handle();
}

