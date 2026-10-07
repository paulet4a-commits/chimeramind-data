import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { filesIn } from '../src/quality.mjs';
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const extra = ['src', 'scripts', 'public', 'content', '.github', 'test'].filter(f => fs.existsSync(f)).flatMap(filesIn);
const pattern = new RegExp('apify_' + 'api_[A-Za-z0-9_-]{10,}');
const failures = [...new Set([...tracked, ...extra])].filter(f => fs.existsSync(f) && pattern.test(fs.readFileSync(f, 'utf8')));
if (failures.length) throw new Error(`Plaintext Apify token found in: ${failures.join(', ')}. Value withheld.`);
console.log('Secret scan: no plaintext Apify tokens in repository files.');
