import type { ReactElement } from 'react';

export interface EditableCountdownProps {
    /** Initial duration in HH:mm:ss.SSS or D:HH:mm:ss.SSS format. */
    initialValue?: string;
    /** Called once when the countdown reaches zero. */
    onComplete?: () => void;
}

export default function EditableCountdown(props: EditableCountdownProps): ReactElement;
