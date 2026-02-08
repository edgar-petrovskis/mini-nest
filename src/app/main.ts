import 'reflect-metadata';

import { NestFactory } from '../framework/factory';
import { createExpressApp } from '../framework/http/express';
import { AppModule } from './app.module';

const port = 8081;

const { router, container } = NestFactory.create(AppModule);
const app = createExpressApp(router, container);

app.listen(port, () => {
  console.log(`Mini-Nest listening on http://localhost:${port}`);
});
