import type { ActionFunction, DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ZodError } from 'zod';

type Method = 'POST' | 'PUT' | 'DELETE';

type Handler = (
  context: Parameters<ActionFunction>[0]
) => ReturnType<ActionFunction>;

export class ActionBuilder {
  private handlers = new Map<Method, Handler>();

  static handleError(error: Error) {
    if (error instanceof ZodError) {
      return json(error.flatten().fieldErrors, { status: 422 });
    }

    return json(
      {
        error: { message: error.message },
      },
      { status: 422 }
    );
  }

  constructor(private context: DataFunctionArgs) {}

  use(method: Method, handler: Handler) {
    this.handlers.set(method, handler);

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
        ? result.catch(ActionBuilder.handleError)
        : result;
    } catch (e: any) {
      return ActionBuilder.handleError(e);
    }
  }
}
