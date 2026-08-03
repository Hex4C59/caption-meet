import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fixtureRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(fixtureRoot, '../..');
const upstream = path.resolve(process.env.WI002_CLIENT ?? path.join(repoRoot, 'build/wi002-browser/upstream'));
const { createServer } = await import(pathToFileURL(path.join(upstream, 'node_modules/vite/dist/node/index.js')));
const server = await createServer({
  configFile: false,
  root: fixtureRoot,
  cacheDir: path.join(repoRoot, 'build/wi002-browser/vite-cache'),
  resolve: { alias: { 'upstream-client': path.join(upstream, 'src') } },
  server: { host: '127.0.0.1', port: 18081, strictPort: true, fs: { allow: [fixtureRoot, upstream] } },
});
await server.listen();
console.log('WI-002 fixture: http://127.0.0.1:18081/browser.html');
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
  await server.close();
  process.exit(0);
});
