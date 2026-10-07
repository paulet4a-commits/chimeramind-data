import { validateData } from '../src/quality.mjs';
import { fileURLToPath } from 'node:url';
console.log('Data quality:', validateData(fileURLToPath(new URL('..', import.meta.url)), { release: process.argv.includes('--release') }));
