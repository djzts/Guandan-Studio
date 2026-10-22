import { mkdir, cp, rm } from 'node:fs/promises';
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
for (const name of ['index.html','styles.css','favicon.svg','src','RULES.md']) {
  await cp(new URL(`../${name}`, import.meta.url), new URL(`../dist/${name}`, import.meta.url), { recursive: true });
}
console.log('Static site built in dist/');
