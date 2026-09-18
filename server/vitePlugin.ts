/**
 * AGIES ALERT - Vite Backend Middleware Plugin
 * Connects the real backend router to the Vite development and preview server.
 */

import { Plugin } from 'vite';
import { handleBackendApiRequest, HttpRequestContext } from './router';

export function agiesBackendPlugin(): Plugin {
  return {
    name: 'agies-alert-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';
        const [path, queryString] = urlStr.split('?');

        if (!path.startsWith('/api')) {
          return next();
        }

        // Parse query string
        const query: Record<string, string> = {};
        if (queryString) {
          const params = new URLSearchParams(queryString);
          params.forEach((val, key) => {
            query[key] = val;
          });
        }

        // Parse request body for POST/PUT/PATCH/DELETE
        let body: any = undefined;
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
          body = await new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : undefined);
              } catch {
                resolve(data);
              }
            });
          });
        }

        const httpContext: HttpRequestContext = {
          method: req.method || 'GET',
          url: urlStr,
          path,
          query,
          headers: req.headers as any,
          body,
          clientIp: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        };

        try {
          const response = await handleBackendApiRequest(httpContext);

          res.statusCode = response.status;
          for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
          }

          if (response.status === 204 || response.body === '' || response.body === undefined) {
            res.end();
          } else {
            res.end(typeof response.body === 'string' ? response.body : JSON.stringify(response.body));
          }
        } catch (pluginErr) {
          console.error('[Vite Backend Middleware Plugin Exception]', pluginErr);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred while processing the request.',
              status: 500
            }
          }));
        }
      });
    },
  };
}
