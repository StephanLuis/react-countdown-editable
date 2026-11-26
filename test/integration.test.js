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

after(async () => {
    await act(async () => root.unmount());
    dom.window.close();
});

test('starts with the chosen value, stops, and rejects zero', async () => {
    const ref = React.createRef();
    const events = [];
    await act(async () => root.render(React.createElement(EditableCountdown, {
        ref, initialValue: '0:00:00:02.000',
        onStart: () => events.push('start'), onStop: () => events.push('stop'),
    })));
    await waitForInput('0:00:00:02.000');
    assert.equal(container.querySelector('button'), null);
    await act(async () => {
        assert.equal(ref.current.start(), true);
        assert.equal(ref.current.start(), false);
    });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
    const running = container.querySelector('input-duration');
    assert.equal(running.disabled, true);
    assert.match(running.value, /^0:00:00:01\.\d{3}$/);
    await act(async () => {
        assert.equal(ref.current.stop(), true);
        assert.equal(ref.current.stop(), false);
    });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    const stopped = container.querySelector('input-duration');
    assert.equal(stopped.disabled, false);
    assert.match(stopped.value, /^0:00:00:01\.\d{3}$/);
    await act(async () => { stopped.value = '0:00:00:00.000'; });
    assert.throws(() => ref.current.start(), /greater than zero/);
    assert.deepEqual(events, ['start', 'stop']);
});

test('calls onComplete and re-enables editing after expiry', async () => {
    let completed = 0;
    const ref = React.createRef();
    await act(async () => {
        root.render(React.createElement(EditableCountdown, {
            key: 'completion',
            ref,
            initialValue: '0:00:00:00.100',
            onComplete: () => { completed += 1; },
        }));
    });
    await waitForInput('0:00:00:00.100');
    await act(async () => ref.current.start());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); });
    await waitForInput('0:00:00:00.000');
    assert.equal(completed, 1);
    assert.equal(ref.current.stop(), false);
    assert.equal(container.querySelector('input-duration').disabled, false);
});

test('stopping after the deadline completes only once', async () => {
    const ref = React.createRef();
    const events = [];
    await act(async () => root.render(React.createElement(EditableCountdown, {
        key: 'late-stop',
        ref,
        initialValue: '0:00:00:10.000',
        onStop: () => events.push('stop'),
        onComplete: () => events.push('complete'),
    })));
    await waitForInput('0:00:00:10.000');
    await act(async () => ref.current.start());
    const now = Date.now;
    try {
        Date.now = () => now() + 11000;
        await act(async () => {
            assert.equal(ref.current.stop(), true);
            assert.equal(ref.current.stop(), false);
        });
    } finally {
        Date.now = now;
    }
    await waitForInput('0:00:00:00.000');
    assert.deepEqual(events, ['complete']);
});
