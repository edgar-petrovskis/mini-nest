import 'reflect-metadata';

import { NestFactory } from '../framework/factory';
import { AppModule } from './app.module';

const port = 8081;

const app = NestFactory.create(AppModule);

app.listen(port, () => {
  console.log(`Mini-Nest listening on http://localhost:${port}`);
});
