import { PrismaClient } from '@prisma/client';
import invariant from 'tiny-invariant';

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = getClient();
} else {
  if (!global.__db__) {
    global.__db__ = getClient();
  }
  prisma = global.__db__;
}

function getClient() {
  const { DATABASE_URL } = process.env;

  invariant(!!DATABASE_URL, 'DATABASE_URL env var not set');

  const databaseUrl = new URL(DATABASE_URL);

  console.log(`🔌 setting up prisma client to ${databaseUrl.host}`);

  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      'error',
      'info',
      'warn',
    ],
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });

  client.$on(
    'query',
    ({ query: parametrizedQuery, params: paramsString, duration, target }) => {
      try {
        const params: unknown[] = JSON.parse(paramsString);

        const query = params.reduce<string>(
          (q, param, index) =>
            q.replace(
              `$${index + 1}`,
              typeof param === 'string' || param instanceof Date
                ? `'${param}'`
                : `${param}`
            ),
          parametrizedQuery
        );

        console.log('\x1b[36m%s\x1b[0m', query);
        console.log('Params:', params);
      } catch (e) {
        console.log('\x1b[36m%s\x1b[0m', parametrizedQuery);
        console.log('Params:', paramsString);
      }

      console.log(`Duration: ${duration} ms`);
    }
  );

  client.$connect();

  return client;
}

export { prisma };
