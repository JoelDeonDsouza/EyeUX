import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { EyeScrollProvider } from './index';
import Docs from './demo/Docs.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EyeScrollProvider
      config={{
        sensitivity: 1,
        delayMs: 1000,
        scrollAmount: 50,
        direction: 'both',
        showControls: true,
        autoStart: false,
      }}
    >
      <Docs />
    </EyeScrollProvider>
  </React.StrictMode>,
);
