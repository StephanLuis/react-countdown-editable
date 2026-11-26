import assert from 'node:assert/strict';
import { test } from 'node:test';
import { durationInMilliseconds, durationValue } from '../duration.js';

test('converts days and milliseconds to and from durations', () => {
    assert.equal(durationInMilliseconds('1:02:03:04.005'), 93784005);
    assert.equal(durationValue(93784005), '1:02:03:04.005');
    assert.equal(durationInMilliseconds('99:59:59.999'), 359999999);
});

test('rejects invalid, zero, and unrepresentable durations', () => {
    for (const value of ['0:00:00:00.000', '0:24:00:00.000', 'no', '999999999999999:00:00:00.000']) {
        assert.throws(() => durationInMilliseconds(value));
    }
});
