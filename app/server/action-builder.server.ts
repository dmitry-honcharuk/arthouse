import type { ActionFunction, DataFunctionArgs } from '@remix-run/node';

type Method = 'POST' | 'PUT';

type Handler = (
  context: Parameters<ActionFunction>[0]
) => ReturnType<ActionFunction>;

export class ActionBuilder {
  private handlers = new Map<Method, Handler>();

  constructor(private context: DataFunctionArgs) {}

  use(method: Method, handler: Handler) {
    this.handlers.set(method, handler);

    return this;
  }

  build(): Handler {
    const {
      request: { method },
    } = this.context;

    const handler = this.handlers.get(method as Method);

    if (!handler) {
      throw new Response(null, { status: 405 });
    }

    return handler(this.context);
  }
}
