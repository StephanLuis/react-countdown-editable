import React from 'react';
import { createRoot } from 'react-dom/client';
import EditableCountdown from './index.js';

createRoot(document.querySelector('#app')).render(React.createElement(EditableCountdown));
