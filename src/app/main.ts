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

const app = NestFactory.create(AppModule);
app.useGlobalGuards(new GlobalGuard());

app.listen(port, () => {
  console.log(`Mini-Nest listening on http://localhost:${port}`);
});
