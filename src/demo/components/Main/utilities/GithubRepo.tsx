import { useState } from 'react';
import { GithubWrapper, HeaderText, CodeWrapper, CopyButton, CodeBlock } from '../styles';

const GithubRepo = () => {
  const [copied, setCopied] = useState(false);
  const code = `https://github.com/JoelDeonDsouza/EyeUX.git`;

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
    <GithubWrapper>
      <HeaderText>Github Repo</HeaderText>
      <CodeWrapper>
        <CopyButton onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</CopyButton>
        <CodeBlock>{code}</CodeBlock>
      </CodeWrapper>
    </GithubWrapper>
  );
};

export default GithubRepo;
