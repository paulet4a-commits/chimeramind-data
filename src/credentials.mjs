import { execFileSync } from 'node:child_process';

// Never read plaintext secret files. Keyring is explicitly selected for a local build.
export function getApifyToken(env = process.env, execute = execFileSync) {
    const token = env.APIFY_TOKEN?.trim();
    if (token) return token;
    if (env.APIFY_USE_KEYRING === '1' && !env.CI) {
        try {
            const value = execute(env.APIFY_KEYRING_PYTHON || 'python', ['-c', 'import keyring, sys; value=keyring.get_password("chimeramind-data", "APIFY_TOKEN"); sys.stdout.write(value or "")'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000 }).trim();
            if (value) return value;
        } catch { throw new Error('Apify keyring credential unavailable. Configure keyring or APIFY_TOKEN.'); }
    }
    throw new Error('APIFY_TOKEN is required. Fetch and deploy are blocked; configure an environment secret or opt in to local keyring.');
}
