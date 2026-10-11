// Daily (ApifyPublishQueue task, after the publish run): keeps data.chimeramind.com in step with the Store.
// 1. catalog-add --sync-prices --apply: newly published Actors and prices that went live join the lock.
// 2. lock changed → tests, commit, push main (the push runs the Pages deploy workflow);
//    unchanged → dispatch the deploy workflow anyway so users/runs/samples refresh daily.
// Token comes from the local keyring only (APIFY_USE_KEYRING=1, see README); failures alert via Tam Kontrol ntfy.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const env = { ...process.env, APIFY_USE_KEYRING: '1' };
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' && cmd === 'npm' });
const alert = async (body) => {
    try {
        const { notify } = await import('file:///C:/Users/user/Desktop/tam%20kontrol/90-system/notify.mjs');
        await notify('data.chimeramind.com senkronu başarısız', body, 'high', 'warning');
    } catch (e) { console.error(`alert failed: ${e.message}`); }
};

try {
    if (run('git', ['status', '--porcelain', 'data/catalog-lock.json']).trim()) throw new Error('catalog-lock has uncommitted local edits; review by hand');
    console.log(run('node', ['scripts/catalog-add.mjs', '--sync-prices', '--apply']).trim());
    if (run('git', ['status', '--porcelain', 'data/catalog-lock.json']).trim()) {
        run('npm', ['test']);
        run('git', ['add', 'data/catalog-lock.json', 'data/actors.json']);
        run('git', ['commit', '-q', '-m', 'chore(catalog): günlük senkron — yeni public aktörler / yürürlüğe giren fiyatlar']);
        run('git', ['push', '-q', 'origin', 'HEAD:refs/heads/main']);
        console.log(`${new Date().toISOString()} catalog changed: committed + pushed (deploy runs on push)`);
    } else {
        run('gh', ['workflow', 'run', 'growth-v2.yml', '-R', 'paulet4a-commits/chimeramind-data', '--ref', 'main']);
        console.log(`${new Date().toISOString()} catalog unchanged: deploy workflow dispatched`);
    }
} catch (e) {
    const msg = `${e.message}\n${e.stderr ?? ''}`.slice(0, 600);
    console.error(msg);
    await alert(msg);
    process.exit(1);
}
