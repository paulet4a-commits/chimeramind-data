import { fileURLToPath } from 'node:url';
import { validateDist } from '../src/quality.mjs';
console.log('Build quality:', validateDist(fileURLToPath(new URL('..', import.meta.url))));
