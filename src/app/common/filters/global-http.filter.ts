import { HttpException } from '../../../framework/http/errors/exceptions';

export class GlobalHttpFilter {
  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      return {
        status: exception.status,
        body: {
          statusCode: exception.status,
          message: exception.message,
          filter: 'global',
        },
        contentType: 'json' as const,
      };
    }

    return {
      status: 500,
      body: {
        statusCode: 500,
        message: 'Internal Server Error',
        filter: 'global',
      },
      contentType: 'json' as const,
    };
  }
}
