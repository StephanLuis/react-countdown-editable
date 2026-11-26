import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import InputDuration from '@stephanluis/react-input-duration';
import countdownModule from 'react-countdown';
import { durationInMilliseconds, durationValue } from './duration.js';

const h = React.createElement;
const Countdown = typeof countdownModule === 'function' ? countdownModule : countdownModule.default;

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
            const nextRun = { target: Date.now() + durationInMilliseconds(element.value) };
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
