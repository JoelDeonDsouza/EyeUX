# 🚀 EyeUX

EyeUX enables hands-free scrolling in your React web applications through real-time eye tracking powered by WebGazer.js. It offers seamless integration via a simple React provider and hook system, allowing you to bring gaze-based interaction into your app with just a few lines of code.

## Tech Stack

**Client:** React, Typescript, Webgazer.js

## Installation

```
npm i eye-ux
```

## 🚀 Quick Start

- Wrap your app in EyeuxProvider

```
import React from 'react';
import { EyeScrollProvider } from 'eyeux';

function App() {
  return (
    <EyeScrollProvider config={{ direction: 'vertical', autoStart: true }}>
      <YourContent />
    </EyeScrollProvider>
  );
}

```

- Use the useEyeScroll() Hook:

```
import { useEyeScroll } from 'eyeux';

function Controls() {
  const { isTracking, start, stop, updateConfig } = useEyeScroll();

  return (
    <div>
      <p>Tracking: {isTracking ? 'ON' : 'OFF'}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button
        onClick={() => updateConfig({ sensitivity: 2 })}
      >
        Increase Sensitivity
      </button>
    </div>
  );
}
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/JoelDeonDsouza/EyeUX.git
```

Go to the project directory

```bash
  cd EyeUX
```

Install dependencies

```bash
  npm install
```
