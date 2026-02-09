import { HttpException } from '../../../framework/http/errors/exceptions';

export class ApiKeyGuard {
  canActivate(ctx: any): true {
    const apiKey = ctx.request.query?.apiKey;

    if (apiKey !== 'secret') {
      throw new HttpException(403, 'Invalid api key');
    }

    return true;
  }
}
