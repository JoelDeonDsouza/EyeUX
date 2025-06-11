import { useState } from 'react';
import {
  ComponentWrapper,
  HeaderText,
  SubText,
  CodeWrapper,
  CopyButton,
  CodeBlock,
} from '../styles';

const QuickStart = () => {
  const [copied, setCopied] = useState(false);
  const code = `import React from 'react';
import { EyeScrollProvider } from 'eyeux'; 

function App() {
  return (
    <EyeScrollProvider config={{ direction: 'vertical', autoStart: true }}>
      <YourContent />
    </EyeScrollProvider>
  );
}
`;

  const codeTwo = `
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

`;

  // Copy handler //
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code || codeTwo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  return (
    <ComponentWrapper>
      <HeaderText>🚀 Quick Start</HeaderText>
      <SubText>Wrap your app in EyeuxProvider</SubText>
      <CodeWrapper>
        <CopyButton onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</CopyButton>
        <CodeBlock>{code}</CodeBlock>
      </CodeWrapper>
      {/* Hooks */}
      <SubText>Use the useEyeScroll() Hook:</SubText>
      <CodeWrapper>
        <CopyButton onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</CopyButton>
        <CodeBlock>{codeTwo}</CodeBlock>
      </CodeWrapper>
    </ComponentWrapper>
  );
};

export default QuickStart;
