import { createRef } from 'react';
import EditableCountdown, { type EditableCountdownHandle } from '../index.js';

const ref = createRef<EditableCountdownHandle>();
<EditableCountdown ref={ref} initialValue="0:00:00:10.000" onStart={() => {}} onStop={() => {}} onComplete={() => {}} />;
ref.current?.start();
ref.current?.stop();
// @ts-expect-error Duration must be a string.
<EditableCountdown initialValue={10} />;
