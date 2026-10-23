// Local-only helper for exported Apify dataset JSON arrays. No network or dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const text = value => typeof value === 'string' && value.trim().length > 0;
const valuePresent = value => Array.isArray(value) ? value.length > 0 && value.every(valuePresent) :
    value !== null && value !== undefined && (typeof value !== 'string' || text(value));
const httpUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };

export function inspect(rows, mode, fields = ['title']) {
    if (!['css', 'youtube'].includes(mode)) throw new Error('Mode must be css or youtube');
    if (!Array.isArray(rows)) throw new Error('Export the dataset as a JSON array');
    if (!fields.length || fields.some(f => !text(f))) throw new Error('Supply required CSS field names');
    const issues = [], seen = new Set();
    rows.forEach((row, index) => {
        const reasons = [];
        if (!row || typeof row !== 'object' || Array.isArray(row)) reasons.push('invalid-row');
        else {
            if (row.error !== null && row.error !== undefined && row.error !== '') reasons.push('actor-error');
            if (mode === 'css') {
                for (const field of fields) {
                    if (!valuePresent(row.fields?.[field]) || !(Number(row.matchCounts?.[field]) > 0)) reasons.push(`missing-field:${field}`);
                }
            } else {
                for (const field of ['channelId', 'videoId', 'title']) if (!text(row[field])) reasons.push(`missing-field:${field}`);
                if (!httpUrl(row.url)) reasons.push('invalid-video-url');
                if (text(row.channelId) && text(row.videoId)) {
                    const key = JSON.stringify([row.channelId, row.videoId]);
                    if (seen.has(key)) reasons.push('duplicate-video');
                    seen.add(key);
                }
            }
        }
        if (reasons.length) issues.push({ row: index + 1, reasons });
    });
    return { accepted: rows.length > 0 && issues.length === 0, totalRows: rows.length,
        usableRows: rows.length - issues.length, issues,
        ...(rows.length === 0 ? { reason: 'empty-dataset-needs-review' } : {}) };
}

export function compareVideos(previous, current) {
    const before = inspect(previous, 'youtube'), after = inspect(current, 'youtube');
    if (!before.accepted || !after.accepted) return { comparable: false, reason: 'both-snapshots-must-pass', before, after };
    const channels = rows => [...new Set(rows.map(r => r.channelId))].sort();
    if (JSON.stringify(channels(previous)) !== JSON.stringify(channels(current))) return { comparable: false, reason: 'channel-set-changed' };
    const key = row => JSON.stringify([row.channelId, row.videoId]);
    const old = new Set(previous.map(key));
    const newlyObserved = current.filter(row => !old.has(key(row))).map(({ channelId, videoId, title, url }) => ({ channelId, videoId, title, url }));
    return { comparable: true, newlyObservedCount: newlyObserved.length, newlyObserved,
        note: 'Newly observed in these snapshots, not proof of upload time. Missing old IDs do not prove deletion. Keep identical tab, sort and limits; a bounded window can miss uploads.' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const [mode, first, second] = process.argv.slice(2);
        if (!first || !['css', 'youtube', 'youtube-diff'].includes(mode)) throw new Error('Usage: node check-results.mjs css current.json title,price | youtube current.json | youtube-diff previous.json current.json');
        const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
        const result = mode === 'youtube-diff' ? compareVideos(read(first), read(second)) : inspect(read(first), mode, second ? second.split(',').map(f => f.trim()) : ['title']);
        console.log(JSON.stringify(result, null, 2));
        process.exitCode = (result.accepted ?? result.comparable) ? 0 : 2;
    } catch {
        console.error('Could not check results. Use JSON array exports and the documented command; check file paths and mode.');
        process.exitCode = 1;
    }
}
