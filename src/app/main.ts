import 'reflect-metadata';
import { Container, Injectable, Inject } from '../framework';

@Injectable()
class ConfigService {
  value = 'from ConfigService';
}

@Injectable()
class AppService {
  constructor(@Inject(ConfigService) public config: ConfigService) {}
}

const container = new Container();

const app = container.resolve(AppService);

console.log('app is AppService:', app instanceof AppService);
console.log('config is ConfigService:', app.config instanceof ConfigService);
console.log('config.value:', app.config.value);

const newConfig = container.resolve(ConfigService);
console.log('singleton config:', app.config === newConfig);
