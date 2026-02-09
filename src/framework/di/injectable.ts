import 'reflect-metadata';

export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('mini-nest:injectable', true, target);
  };
}

export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata('mini-nest:injectable', target) === true;
}
