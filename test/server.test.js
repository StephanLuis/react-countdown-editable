import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import EditableCountdown from '../index.js';

test('renders on the server without browser globals', () => {
    const html = renderToString(React.createElement(EditableCountdown));
    assert.match(html, /input-duration/);
    assert.match(html, />Start</);
});
