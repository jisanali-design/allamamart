import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// In Cloud Run environment for AI Studio:
// Nginx listens on PORT (8080) and proxies / to DEFAULT_APP_PORT (3000).
// If PORT is 8080 (Cloud Run container port handled by Nginx), the node server must bind to DEFAULT_APP_PORT (3000) or 3000.
const rawPort = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);
const PORT = process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : rawPort;

app.use(express.json());

// Health check for Cloud Run and monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve assets from public/assets if present
const publicDir = path.resolve(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Serve Vite production build from dist/
const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // SPA client-side fallback - send index.html for all non-file routes
  app.get('*', (req: Request, res: Response) => {
    // If request has file extension and was not found, return 404
    if (path.extname(req.path)) {
      res.status(404).end();
      return;
    }
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
} else {
  // Dist not found fallback
  app.get('*', (_req: Request, res: Response) => {
    res.status(503).send('Application is still building. Please refresh in a few moments.');
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
