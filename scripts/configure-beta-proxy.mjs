import { readFile, writeFile } from 'node:fs/promises';
const raw = process.argv[2];
if (!raw) throw new Error('Uso: node scripts/configure-beta-proxy.mjs https://SUA-API.up.railway.app');
const url = new URL(raw);
if (url.protocol !== 'https:' || url.pathname !== '/' || url.username || url.password || url.search || url.hash) throw new Error('Use a origem HTTPS da API, sem caminho ou credenciais.');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
config.rewrites = [
 { source: '/api/:path*', destination: `${url.origin}/api/:path*` },
 ...config.rewrites.filter(rule => rule.source !== '/api/:path*'),
];
await writeFile('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log('Proxy configurado. Revise e inclua vercel.json no próximo deploy.');
