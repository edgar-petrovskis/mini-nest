export class HttpException extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

