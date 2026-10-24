// Carry campaign labels across this site without cookies, storage or visitor IDs.
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const valid = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._~-]{0,99}$/.test(value);
export function campaignFrom(url) {
    const query = new URL(url).searchParams;
    return Object.fromEntries(FIELDS.filter(k => valid(query.get(k))).map(k => [k, query.get(k)]));
}
export function attributeLink(href, current) {
    let here, target;
    try { here = new URL(current); target = new URL(href, here); } catch { return href; }
    const campaign = campaignFrom(current);
    if (target.protocol !== 'https:' || !Object.keys(campaign).length) return target.href;
    if (target.origin === here.origin && /^\/(?:$|start\/|guides\/|tools\/|workflows\/)/.test(target.pathname)) {
        for (const [key, value] of Object.entries(campaign)) target.searchParams.set(key, value);
    } else if (target.origin === 'https://apify.com' && target.pathname.startsWith('/webdatatools/') && target.searchParams.has('source_actor')) {
        // Keep site/page/placement attribution and add the original acquisition labels.
        for (const [key, value] of Object.entries(campaign)) target.searchParams.set(`acquisition_${key.slice(4)}`, value);
    }
    return target.href;
}
if (typeof document !== 'undefined') {
    for (const a of document.querySelectorAll('a[href]')) {
        if (!/^(?:https?:\/\/|\/)/.test(a.getAttribute('href'))) continue;
        a.href = attributeLink(a.getAttribute('href'), location.href);
    }
}
