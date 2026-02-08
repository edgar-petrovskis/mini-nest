import 'reflect-metadata';

import { NestFactory } from '../framework/factory';
import { AppModule } from './app.module';
import { GlobalHttpFilter } from './common/filters/global-http.filter';
import { TrimStringPipe } from './common/pipes/trim-string.pipe';

const port = 8081;

class GlobalTraceInterceptor {
  async intercept(ctx: any, next: any) {
    const req = ctx.request as any;
    req.trace ??= [];
    req.trace.push(`global-before:${String(ctx.handlerName)}`);

    const result = await next.handle();

    req.trace.push(`global-after:${String(ctx.handlerName)}`);

    if (result && typeof result === 'object') {
      return { ...(result as object), trace: [...req.trace] };
    }

    return result;
  }
}

const app = NestFactory.create(AppModule);
app.useGlobalPipes(new TrimStringPipe());
app.useGlobalFilters(new GlobalHttpFilter());
app.useGlobalInterceptors(new GlobalTraceInterceptor());

app.listen(port, () => {
  console.log(`Mini-Nest app listening on http://localhost:${port}`);
});
