import EditableCountdown from '../index.js';

<EditableCountdown initialValue="0:00:00:10.000" onComplete={() => {}} />;
// @ts-expect-error Duration must be a string.
<EditableCountdown initialValue={10} />;
