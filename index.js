import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import InputDuration from '@stephanluis/react-input-duration';
import countdownModule from 'react-countdown';

const h = React.createElement;
const Countdown = typeof countdownModule === 'function' ? countdownModule : countdownModule.default;

function countdownMilliseconds(element) {
    let total;
    try {
        total = element.valueAsMilliseconds;
    } catch (error) {
        if (!(error instanceof RangeError)) throw error;
        throw new Error('Enter a duration greater than zero and within the supported date range.');
    }
    if (!Number.isSafeInteger(total) || total <= 0 || !Number.isFinite(new Date(Date.now() + total).getTime())) {
        throw new Error('Enter a duration greater than zero and within the supported date range.');
    }
    return total;
}

function durationValue(total) {
    const pad = (value, width) => String(value).padStart(width, '0');
    const days = Math.floor(total / 86400000);
    const hours = Math.floor(total % 86400000 / 3600000);
    const minutes = Math.floor(total % 3600000 / 60000);
    const seconds = Math.floor(total % 60000 / 1000);
    return `${days}:${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(total % 1000, 3)}`;
}

const EditableCountdown = forwardRef(function EditableCountdown({
    initialValue = '0:00:00:10.000', onStart, onStop, onComplete,
}, ref) {
    const [value, setValue] = useState(initialValue);
    const [run, setRun] = useState(null);
    const inputRef = useRef(null);
    const active = useRef(null);

    function complete(completedRun) {
        if (active.current !== completedRun) return;
        active.current = null;
        setRun(null);
        setValue(durationValue(0));
        onComplete?.();
    }

    useImperativeHandle(ref, () => ({
        start() {
            if (active.current) return false;
            const element = inputRef.current;
            if (!element || typeof element.checkValidity !== 'function' || element.disabled) {
                throw new Error('The duration input is still loading.');
            }
            if (!element.checkValidity()) throw new Error('Enter a complete duration.');
            const nextRun = { target: Date.now() + countdownMilliseconds(element) };
            setValue(element.value);
            active.current = nextRun;
            setRun(nextRun);
            onStart?.();
            return true;
        },
        stop() {
            const currentRun = active.current;
            if (!currentRun) return false;
            const remaining = Math.max(0, currentRun.target - Date.now());
            if (remaining === 0) {
                complete(currentRun);
                return true;
            }
            active.current = null;
            setRun(null);
            setValue(durationValue(remaining));
            onStop?.();
            return true;
        },
    }));

    const editor = remaining => h(InputDuration, {
        ref: inputRef,
        value: remaining,
        onChange: setValue,
        showDays: true,
        disabled: run !== null,
        'aria-label': run === null ? 'Set duration' : 'Time remaining',
    });

    return run === null
        ? editor(value)
        : h(Countdown, {
            date: run.target,
            intervalDelay: 50,
            precision: 3,
            renderer: ({ total }) => editor(durationValue(total)),
            onComplete: () => complete(run),
        });
});

export default EditableCountdown;
