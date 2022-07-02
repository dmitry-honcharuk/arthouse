import type { Permission } from '@prisma/client';
import type { ActionFunction, DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ZodError } from 'zod';
import { verifyAdminToken } from '~/modules/auth/jwt/admin-token.server';
import { isResponse } from './is-response.server';
import { getSession } from './sessions.server';

type Method = 'POST' | 'PUT' | 'DELETE' | 'GET';

type ActionHandler = (
  context: Parameters<ActionFunction>[0]
) => Promise<Response>;

type CorsConfig = {
  origin: string;
};

export class ActionBuilder {
  private handlers = new Map<Method, ActionHandler>();

  private corsConfig: null | CorsConfig = null;

  private permissions: null | Permission[] = null;

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

  use(method: Method, handler: ActionHandler) {
    this.handlers.set(method, handler);

    return this;
  }

  cors(config: CorsConfig = { origin: '*' }): this {
    this.corsConfig = config;

    return this;
  }

  allow(permissions: Permission[]) {
    this.permissions = permissions;

    return this;
  }

  async build(): Promise<Response> {
    try {
      const {
        request: { method },
      } = this.context;

      const handler = this.handlers.get(method as Method);

      if (!handler) {
        return new Response(null, { status: 405 });
      }

      if (!(await this.checkPermissions())) {
        return new Response(null, { status: 401 });
      }

      const result = handler(this.context);

      return (result instanceof Promise ? result : Promise.resolve(result))
        .then((r) => this.wrapWithCors(r))
        .catch(ActionBuilder.handleError);
    } catch (e) {
      return ActionBuilder.handleError(e as Error);
    }
  }

  private async checkPermissions() {
    if (!this.permissions) {
      return true;
    }

    const { request } = this.context;

    const session = await getSession(request.headers.get('Cookie'));

    const token = session.get('admin-token');

    if (!token) {
      return false;
    }

    const payload = verifyAdminToken(token);

    if (!payload) {
      return false;
    }

    return this.permissions.some((permission) =>
      payload.permissions.includes(permission)
    );
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
