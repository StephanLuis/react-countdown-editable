# Editable React countdown

An independent integration of [`@stephanluis/react-input-duration`](https://www.npmjs.com/package/@stephanluis/react-input-duration)
and [`react-countdown`](https://github.com/ndresx/react-countdown). Edit a duration and press Start;
the same control shows the remaining time. Press Stop to edit the remaining duration.

This package is a local prototype and has not been published.

```jsx
import EditableCountdown from '@stephanluis/react-countdown-editable';

<EditableCountdown initialValue="0:00:00:10.000" onComplete={() => console.log('Finished')} />
```

`initialValue` accepts `HH:mm:ss.SSS` or `D:HH:mm:ss.SSS`; it is used only on mount.
The timer rejects zero or durations outside JavaScript's safe integer and date ranges. React 18.2
or 19 and React DOM are required. The input is disabled while running and re-enabled on stop
or completion. This project is not affiliated with or endorsed by react-countdown.

## Local demo

Run `npm install`, then `npm run demo`, and open the URL printed by Vite. Run `npm test` to check
the integration and its TypeScript declarations.
