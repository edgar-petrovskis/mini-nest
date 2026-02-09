# mini-nest

A minimal Nest-like framework focused on runtime execution mechanics:

- IoC / DI container
- module graph bootstrap
- HTTP decorators + route dispatch
- Parameters, Pipes, Guards, Interceptors, Filters

This repo contains:

1. Framework code in `src/framework`
2. Demo app in `src/app`

## Quick Start

```bash
npm install
npm run build
npm run start:dev
```

Server: `http://localhost:8081`

## Demo App

The `Cats` app uses all core framework parts:

- DI: `@Injectable`, `@Inject`, transitive `resolve`
- Modules: `imports/providers/controllers/exports`
- HTTP: `@Controller`, `@Get/@Post/@Put/@Patch/@Delete`
- Params: `@Param/@Query/@Body`
- Pipes: global + route-level + `ZodValidationPipe`
- Guards: API key protection
- Interceptors: before/after response wrapping (`trace`)
- Filters: global and controller-level error mapping

For cats endpoints use:

- `?apiKey=secret`

## Feature Verification Matrix

| Feature                           | Primary Check                                                                                                              | Expected Result                                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| IoC/DI + Modules bootstrap        | `curl "http://localhost:8081/cats?apiKey=secret"`                                                                          | Route is available from imported module and response is produced through controller -> service -> repository DI chain.                              |
| HTTP decorators and handlers      | `curl -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"Tom","age":3}'`  | Matching handler executes for declared HTTP method and path.                                                                                        |
| Params (`@Param/@Query/@Body`)    | `curl "http://localhost:8081/cats/1?apiKey=secret"`                                                                        | Route param is extracted and passed to the handler (with param-level pipes when configured).                                                        |
| Pipes + Zod validation            | `curl -i -X POST "http://localhost:8081/cats?apiKey=secret" -H "content-type: application/json" -d '{"name":"","age":-1}'` | Validation fails and returns HTTP `400`.                                                                                                            |
| Guards                            | `curl -i "http://localhost:8081/cats?apiKey=wrong"`                                                                        | Guard blocks request with HTTP `403`.                                                                                                               |
| Interceptors                      | `curl "http://localhost:8081/cats?apiKey=secret"`                                                                          | Response `trace` shows wrapper order: `global-before:list -> controller-before:list -> handler:list -> controller-after:list -> global-after:list`. |
| Filters + `HttpException` mapping | `curl -i "http://localhost:8081/cats/999?apiKey=secret"`                                                                   | Exception is transformed by filters into structured HTTP response.                                                                                  |
