import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

const ssrCache = new Map<string, { html: string; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/admin')) {
    const cached = ssrCache.get(req.url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.send(cached.html);
      return;
    }
  }

  angularApp
    .handle(req)
    .then(async (response) => {
      if (response) {
        if (req.method === 'GET' && response.status === 200 && !req.url.startsWith('/admin')) {
          try {
            const resClone = response.clone();
            const html = await resClone.text();
            ssrCache.set(req.url, { html, timestamp: Date.now() });
          } catch (e) {
            console.error('SSR Cache Error:', e);
          }
        }
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
