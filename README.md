# mini-nest

A minimal Nest-like framework focused on runtime mechanics:

- IoC/DI container
- Module graph bootstrap
- HTTP decorators and route dispatch
- Parameters, Pipes, Guards, Interceptors, Filters

This repository includes both:

1. Framework implementation in `src/framework`
2. Demo application built on top of the framework in `src/app`

## Quick Start

```bash
npm install
npm run build
npm run start:dev
```

Server starts on `http://localhost:8081`.

## Demo App Overview

The demo app is a `Cats` API that uses the full framework feature set:

- `@Injectable`, `@Inject`, DI resolution
- `@Module` imports/providers/controllers/exports
- `@Controller` + `@Get/@Post/@Put/@Patch/@Delete`
- `@Param/@Query/@Body`
- `@UsePipe` + `ZodValidationPipe`
- `@UseGuard`
- `@UseInterceptor`
- `@UseFilter` + global filter

Guard requirement for cats endpoints:

- add `?apiKey=secret` to requests

## Homework Verification Matrix

| Feature                                                               | How to Verify                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Expected Result                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| IoC / DI: `@Injectable`, `@Inject`, `resolve` with transitive deps    | `curl "http://localhost:8081/cats?apiKey=secret"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Request succeeds and returns JSON from the controller-service-repository chain created via DI.     |
| Modules: root graph bootstrap and module composition                  | `curl "http://localhost:8081/cats?apiKey=secret"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Routes from imported modules are available after `NestFactory.create(AppModule)`.                  |
| HTTP decorators register handlers (`@Controller`, methods)            | Check method mapping:<br><br>1. `curl "http://localhost:8081/cats?apiKey=secret"`<br>2. `curl -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"Tom","age":3}'`<br>3. `curl -X PUT "http://localhost:8081/cats/1?apiKey=secret" -H "content-type: application/json" -d '{"name":"Tommy","age":4}'`<br>4. `curl -X PATCH "http://localhost:8081/cats/1?apiKey=secret" -H "content-type: application/json" -d '{"age":5}'`<br>5. `curl -X DELETE "http://localhost:8081/cats/1?apiKey=secret"` | Each HTTP method is routed to its matching handler and returns the expected response shape/status. |
| Parameters: `@Param`, `@Query`, `@Body`                               | `@Param` + pipe:<br>`curl "http://localhost:8081/cats/1?apiKey=secret"`<br><br>`@Query`:<br>`curl "http://localhost:8081/cats?apiKey=secret&limit=1"`<br><br>`@Body`:<br>`curl -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"Tom","age":3}'`                                                                                                                                                                                                                                             | `id` is read from params, `limit` from query, and payload from body and passed into handlers.      |
| Pipes order and execution (`Global -> Controller -> Method -> Param`) | Global trim pipe is enabled in `main.ts`.<br><br>`curl -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"  Tom  ","age":3}'`                                                                                                                                                                                                                                                                                                                                                                 | Name is trimmed before persistence/response, showing pipe execution in the request pipeline.       |
| Zod validation pipe returns HTTP 400                                  | Send invalid body:<br><br>`curl -i -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"","age":-1}'`                                                                                                                                                                                                                                                                                                                                                                                           | HTTP `400` with validation error message.                                                          |
| Guards block unauthorized access                                      | Missing or invalid key:<br><br>`curl -i "http://localhost:8081/cats"`<br>`curl -i "http://localhost:8081/cats?apiKey=wrong"`                                                                                                                                                                                                                                                                                                                                                                                                                   | HTTP `403` from guard check.                                                                       |
| Interceptors (`before/after`) wrap handler                            | Call endpoint with valid key:<br><br>`curl "http://localhost:8081/cats?apiKey=secret"`                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Response contains `trace` values proving before/after interceptor flow around handler.             |
| `HttpException` maps to HTTP response through Filters                 | Call missing entity:<br><br>`curl -i "http://localhost:8081/cats/999?apiKey=secret"`                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Error is transformed by filters into structured HTTP response (status + body).                     |
| Working bootstrap (`NestFactory.create` + `app.listen`)               | Start app (`npm run start:dev`) and call any endpoint above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Server starts and serves requests on `http://localhost:8081`.                                      |
