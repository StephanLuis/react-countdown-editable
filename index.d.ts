import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface EditableCountdownHandle {
    /** Start with the committed duration; throws if it is invalid or the input is not ready. */
    start(): boolean;
    /** Stop and keep the remaining duration. */
    stop(): boolean;
}

export interface EditableCountdownProps {
    /** Initial duration in HH:mm:ss.SSS or D:HH:mm:ss.SSS format. */
    initialValue?: string;
    /** Called when the countdown starts. */
    onStart?: () => void;
    /** Called when a running countdown is stopped before expiry. */
    onStop?: () => void;
    /** Called once when the countdown reaches zero. */
    onComplete?: () => void;
}

declare const EditableCountdown: ForwardRefExoticComponent<EditableCountdownProps & RefAttributes<EditableCountdownHandle>>;
export default EditableCountdown;
