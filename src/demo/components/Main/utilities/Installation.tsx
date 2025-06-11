import { useState } from 'react';
import {
  InstallationBlock,
  HeaderText,
  SubText,
  CodeWrapper,
  CopyButton,
  CodeBlock,
} from '../styles';

const Installation = () => {
  const [copied, setCopied] = useState(false);
  const code = `npm install eyeux`;

  // Copy handler //
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  return (
    <InstallationBlock>
      <HeaderText>Installation</HeaderText>
      <SubText>
        Add EyeUX to your project to enable gaze-based scrolling with minimal setup.
      </SubText>
      <CodeWrapper>
        <CopyButton onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</CopyButton>
        <CodeBlock>{code}</CodeBlock>
      </CodeWrapper>
    </InstallationBlock>
  );
};

export default Installation;
