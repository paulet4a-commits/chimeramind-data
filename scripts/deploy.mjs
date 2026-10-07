// Publish the tested artifact as a normal gh-pages commit; preserve history and a rollback tag.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getApifyToken } from '../src/credentials.mjs';
import { validateData, validateDist, hash } from '../src/quality.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
getApifyToken();
assert.ok(process.env.GH_TOKEN, 'GH_TOKEN with contents/write and pages/write is required; publish blocked');
assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Publication is restricted to main');
assert.equal(process.env.GITHUB_REPOSITORY, 'paulet4a-commits/chimeramind-data', 'Unexpected repository');
validateData(root, { release: true });
validateDist(root);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/build-manifest.json')));
assert.equal(manifest.sourceCommit, process.env.GITHUB_SHA, 'Artifact source commit mismatch');
const gitEnv = { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader', GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${process.env.GH_TOKEN}`).toString('base64')}` };
const git = (args, cwd = root) => {
    try { return execFileSync('git', args, { cwd, env: gitEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 }).trim(); }
    catch { throw new Error(`Git ${args[0]} failed; publication stopped. No force push was used.`); }
};
const gh = args => {
    try { return execFileSync('gh', args, { cwd: root, env: process.env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }).trim(); }
    catch { throw new Error('GitHub Pages API request failed; inspect the deploy receipt for rollback.'); }
};
assert.equal(git(['ls-remote','origin','refs/heads/main']).split(/\s/)[0], process.env.GITHUB_SHA, 'Main advanced since this run; deploy blocked');
const settings = JSON.parse(gh(['api','repos/paulet4a-commits/chimeramind-data/pages']));
assert.equal(settings.source?.branch, 'gh-pages', 'Pages source changed; deploy blocked');
assert.equal(settings.cname, 'data.chimeramind.com', 'Pages domain changed; deploy blocked');
const stage = path.resolve(root, '.deploy');
assert.equal(path.dirname(stage), path.resolve(root));
assert.equal(path.basename(stage), '.deploy');
if (fs.existsSync(stage)) throw new Error('Deployment directory already exists; inspect and archive it before retrying');
git(['clone','--single-branch','--branch','gh-pages','https://github.com/paulet4a-commits/chimeramind-data.git',stage]);
const previousSha = git(['rev-parse','HEAD'], stage);
const previousFile = path.join(stage, 'build-manifest.json');
if (fs.existsSync(previousFile)) fs.copyFileSync(previousFile, path.join(root, 'data/previous-build-manifest.json'));
// Every deletion is verified to be inside the dedicated deployment checkout.
for (const item of fs.readdirSync(stage)) {
    if (item === '.git') continue;
    const target = path.resolve(stage, item);
    assert.ok(target.startsWith(`${stage}${path.sep}`));
    fs.rmSync(target, { recursive: true, force: true });
}
fs.cpSync(path.join(root, 'dist'), stage, { recursive: true });
git(['config','user.name','ChimeraMiND deploy'], stage);
git(['config','user.email','41898282+github-actions[bot]@users.noreply.github.com'], stage);
git(['add','--all'], stage);
git(['commit','-m',`Growth v2 deploy ${process.env.GITHUB_SHA}`], stage);
const publishedSha = git(['rev-parse','HEAD'], stage);
const rollbackTag = `rollback/gh-pages-${previousSha}`;
if (git(['tag','--list',rollbackTag], stage)) assert.equal(git(['rev-parse',rollbackTag], stage), previousSha, 'Rollback tag points to a different commit');
else git(['tag',rollbackTag,previousSha], stage);
const receipt = { previousSha, publishedSha, rollbackTag, sourceCommit: process.env.GITHUB_SHA, manifestSha256: hash(JSON.stringify(manifest)), requestedAt: new Date().toISOString(), pushed: false };
const receiptFile = path.join(root, 'data/deploy-receipt.json');
fs.writeFileSync(receiptFile, JSON.stringify(receipt,null,2));
git(['push','--atomic','origin',`HEAD:refs/heads/gh-pages`,`refs/tags/${rollbackTag}:refs/tags/${rollbackTag}`], stage);
receipt.pushed = true;
fs.writeFileSync(receiptFile, JSON.stringify(receipt,null,2));
// GITHUB_TOKEN branch pushes don't trigger Pages; request its build explicitly.
gh(['api','--method','POST','repos/paulet4a-commits/chimeramind-data/pages/builds']);
console.log(`gh-pages published ${publishedSha}; rollback tag ${rollbackTag}. Await live verification before IndexNow.`);
