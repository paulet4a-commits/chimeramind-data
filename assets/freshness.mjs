export const SAMPLE_MAX_AGE_MS = 7 * 86400000;

export function sampleStatus(sample, now = Date.now()) {
    if (!sample?.items?.length) return { status: 'missing', label: 'No recorded sample is available yet.' };
    const timestamp = typeof sample.finishedAt === 'string' ? Date.parse(sample.finishedAt) : NaN;
    if (!Number.isFinite(timestamp) || timestamp > now || !sample.runId) {
        return { status: 'invalid', label: 'Sample unavailable: its run date could not be verified.' };
    }
    const ageDays = Math.floor((now - timestamp) / 86400000);
    const status = now - timestamp >= SAMPLE_MAX_AGE_MS ? 'archived' : 'recorded';
    return { status, ageDays, label: `${status === 'archived' ? 'Archived example' : 'Recorded example'} · ${ageDays} ${ageDays === 1 ? 'day' : 'days'} old. This is a snapshot, not current data.` };
}
