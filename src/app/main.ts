import 'reflect-metadata';

import { NestFactory } from '../framework/factory';
import { AppModule } from './app.module';
import { GlobalHttpFilter } from './common/filters/global-http.filter';
import { TrimStringPipe } from './common/pipes/trim-string.pipe';

const port = 8081;

const app = NestFactory.create(AppModule);
app.useGlobalPipes(new TrimStringPipe());
app.useGlobalFilters(new GlobalHttpFilter());

app.listen(port, () => {
  console.log(`Mini-Nest app listening on http://localhost:${port}`);
});
