import React, { useRef, useState } from 'react';
import InputDuration from '@stephanluis/react-input-duration';
import countdownModule from 'react-countdown';
import { durationInMilliseconds, durationValue } from './duration.js';

const h = React.createElement;
const Countdown = typeof countdownModule === 'function' ? countdownModule : countdownModule.default;

export default function EditableCountdown({ initialValue = '0:00:00:10.000', onComplete }) {
    const [value, setValue] = useState(initialValue);
    const [target, setTarget] = useState(null);
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);
    const active = useRef(null);

    function start() {
        const element = inputRef.current;
        if (!element || typeof element.checkValidity !== 'function') {
            setMessage('The duration input is still loading.');
            return;
        }
        try {
            if (!element.checkValidity()) throw new Error('Enter a complete duration.');
            const end = Date.now() + durationInMilliseconds(element.value);
            setValue(element.value);
            active.current = end;
            setTarget(end);
            setMessage('Countdown running.');
        } catch (error) {
            setMessage(error.message);
        }
    }

    function stop() {
        const remaining = Math.max(0, target - Date.now());
        if (remaining === 0) {
            complete();
            return;
        }
        active.current = null;
        setTarget(null);
        setValue(durationValue(remaining));
        setMessage('Countdown stopped. Edit the duration or start again.');
    }

    function complete() {
        if (active.current !== target) return;
        active.current = null;
        setTarget(null);
        setValue(durationValue(0));
        setMessage('Countdown complete.');
        onComplete?.();
    }

    const editor = remaining => h(InputDuration, {
        ref: inputRef,
        value: remaining,
        onChange: setValue,
        showDays: true,
        disabled: target !== null,
        'aria-label': target === null ? 'Set duration' : 'Time remaining',
    });

    return h('div', null,
        target === null
            ? editor(value)
            : h(Countdown, {
                date: target,
                intervalDelay: 50,
                precision: 3,
                renderer: ({ total }) => editor(durationValue(total)),
                onComplete: complete,
            }),
        ' ',
        h('button', { type: 'button', onClick: target === null ? start : stop },
            target === null ? 'Start' : 'Stop'),
        h('p', { role: 'status' }, message));
}
