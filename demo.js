import React from 'react';
import { createRoot } from 'react-dom/client';
import EditableCountdown from './index.js';
import demoSource from './demo.js?raw';

const h = React.createElement;

function Demo() {
    const timer = React.useRef(null);
    const [running, setRunning] = React.useState(false);
    const [status, setStatus] = React.useState('Ready.');

    function start() {
        try {
            timer.current.start();
        } catch (error) {
            setStatus(error.message);
        }
    }

    return h(React.Fragment, null,
        h(EditableCountdown, {
            ref: timer,
            onStart: () => { setRunning(true); setStatus('Countdown running.'); },
            onStop: () => { setRunning(false); setStatus('Countdown stopped.'); },
            onComplete: () => { setRunning(false); setStatus('Countdown complete.'); },
        }),
        ' ',
        h('button', { type: 'button', onClick: running ? () => timer.current.stop() : start },
            running ? 'Stop' : 'Start'),
        h('p', { role: 'status' }, status));
}

document.querySelector('#demo-source').textContent = demoSource;
createRoot(document.querySelector('#app')).render(h(Demo));
