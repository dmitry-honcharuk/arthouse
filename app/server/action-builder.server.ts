import type { ActionFunction, DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ZodError } from 'zod';
import { isResponse } from './is-response.server';

type Method = 'POST' | 'PUT' | 'DELETE' | 'GET';

type Handler = (
  context: Parameters<ActionFunction>[0]
) => ReturnType<ActionFunction>;

type CorsConfig = {
  origin: string;
};

export class ActionBuilder {
  private handlers = new Map<Method, Handler>();

  private corsConfig: null | CorsConfig = null;

  static handleError(error: Error) {
    if (error instanceof ZodError) {
      const flattened = error.flatten();

      return json(
        flattened.formErrors.length
          ? {
              error: { message: flattened.formErrors[0] },
            }
          : flattened.fieldErrors,
        { status: 422 }
      );
    }

    return json(
      {
        error: { message: error.message },
      },
      { status: 500 }
    );
  }

  constructor(private context: DataFunctionArgs) {}

  use(method: Method, handler: Handler) {
    this.handlers.set(method, handler);

    return this;
  }

  cors(config: CorsConfig = { origin: '*' }): this {
    this.corsConfig = config;

    return this;
  }

  build(): Handler | Response {
    try {
      const {
        request: { method },
      } = this.context;

      const handler = this.handlers.get(method as Method);

      if (!handler) {
        return new Response(null, { status: 405 });
      }

      const result = handler(this.context);

      return result instanceof Promise
        ? result
            .then((r) => this.wrapWithCors(r))
            .catch(ActionBuilder.handleError)
        : this.wrapWithCors(result);
    } catch (e: any) {
      return ActionBuilder.handleError(e);
    }
  }

  private wrapWithCors<T>(response: T) {
    if (!isResponse(response)) {
      return response;
    }

    if (this.corsConfig) {
      response.headers.set(
        'Access-Control-Allow-Origin',
        this.corsConfig.origin
      );
    }

    return response;
  }
}
