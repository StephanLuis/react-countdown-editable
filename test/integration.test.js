import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import EditableCountdown from '../index.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.customElements = dom.window.customElements;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
    configurable: true,
    value() {
        return { setValidity() {}, setFormValue() {}, checkValidity: () => true };
    },
});

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);

async function waitForInput(value) {
    for (let i = 0; i < 100; i++) {
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
        const element = container.querySelector('input-duration');
        if (element?.shadowRoot && element.value === value) return element;
    }
    throw new Error(`Input did not initialize to ${value}`);
}

async function click() {
    await act(async () => container.querySelector('button').click());
}

after(async () => {
    await act(async () => root.unmount());
    dom.window.close();
});

test('starts with the chosen value, stops, and rejects zero', async () => {
    await act(async () => root.render(React.createElement(EditableCountdown, { initialValue: '0:00:00:02.000' })));
    await waitForInput('0:00:00:02.000');
    await click();
    assert.equal(container.querySelector('button').textContent, 'Stop');
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
    const running = container.querySelector('input-duration');
    assert.equal(running.disabled, true);
    assert.match(running.value, /^0:00:00:01\.\d{3}$/);
    await click();
    assert.equal(container.querySelector('button').textContent, 'Start');
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    const stopped = container.querySelector('input-duration');
    assert.equal(stopped.disabled, false);
    assert.match(stopped.value, /^0:00:00:01\.\d{3}$/);
    await act(async () => { stopped.value = '0:00:00:00.000'; });
    await click();
    assert.match(container.querySelector('[role=status]').textContent, /greater than zero/);
});

test('calls onComplete and re-enables editing after expiry', async () => {
    let completed = 0;
    await act(async () => {
        root.render(React.createElement(EditableCountdown, {
            key: 'completion',
            initialValue: '0:00:00:00.100',
            onComplete: () => { completed += 1; },
        }));
    });
    await waitForInput('0:00:00:00.100');
    await click();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); });
    await waitForInput('0:00:00:00.000');
    assert.equal(completed, 1);
    assert.equal(container.querySelector('button').textContent, 'Start');
    assert.equal(container.querySelector('input-duration').disabled, false);
});
