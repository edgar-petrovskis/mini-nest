export class TraceInterceptor {
  async intercept(ctx: any, next: any) {
    const req = ctx.request as any;
    req.trace ??= [];
    req.trace.push(`controller-before:${String(ctx.handlerName)}`);

    const result = await next.handle();

    req.trace.push(`controller-after:${String(ctx.handlerName)}`);

    if (result && typeof result === 'object') {
      return { ...(result as object), trace: [...req.trace] };
    }

    return result;
  }
}
