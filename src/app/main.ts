import 'reflect-metadata';

import { NestFactory } from '../framework/factory';
import { AppModule } from './app.module';
import { HttpException } from '../framework/http/exceptions';

const port = 8081;

class GlobalGuard {
  canActivate(ctx: any) {
    if (ctx.request.query?.g === '0') {
      throw new HttpException(403, 'GlobalGuard');
    }
    return true;
  }
}

class GlobalTraceInterceptor {
  async intercept(ctx: any, next: any) {
    const req = ctx.request as any;
    req.trace ??= [];
    req.trace.push('global-before');

    const result = await next.handle();

    req.trace.push('global-after');
    return { ...(result ?? {}), trace: [...req.trace] };
  }
}

class GlobalErrorFilter {
  catch(exception: any) {
    return {
      status: 590,
      body: {
        from: 'global-filter',
        message: exception?.message ?? 'unknown',
      },
      contentType: 'json' as const,
    };
  }
}

const app = NestFactory.create(AppModule);
app.useGlobalGuards(new GlobalGuard());
app.useGlobalInterceptors(new GlobalTraceInterceptor());
app.useGlobalFilters(new GlobalErrorFilter());

app.listen(port, () => {
  console.log(`Mini-Nest listening on http://localhost:${port}`);
});
