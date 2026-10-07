import { sampleStatus } from './freshness.mjs';
function update() {
    for (const figure of document.querySelectorAll('[data-sample-finished]')) {
        const state = sampleStatus({ finishedAt: figure.dataset.sampleFinished, runId: figure.dataset.sampleRun, items: [true] });
        figure.dataset.sampleStatus = state.status;
        figure.querySelector('[data-sample-label]').textContent = state.label;
        if (state.status === 'invalid') figure.querySelector('pre').hidden = true;
    }
}
update();
setInterval(update, 60000);
