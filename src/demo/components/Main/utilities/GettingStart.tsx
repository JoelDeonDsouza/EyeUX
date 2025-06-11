import { GettingStartBlcok, HeaderText, SubText, DemoImg } from '../styles';

const GettingStart = () => {
  return (
    <GettingStartBlcok>
      <HeaderText>Getting Start</HeaderText>
      <SubText>
        EyeUX enables hands-free scrolling in your React web applications through real-time eye
        tracking powered by WebGazer.js. It offers seamless integration via a simple React provider
        and hook system, allowing you to bring gaze-based interaction into your app with just a few
        lines of code. Designed for accessibility, productivity, and forward-thinking UX, EyeUX
        automatically detects where the user is looking and scrolls the page accordingly—no
        keyboard, mouse, or touch required. Built to be flexible and developer-friendly, EyeUX
        supports customizable scroll zones, adjustable sensitivity and scroll speed, and intuitive
        behavior tuning. It includes optional visual overlays for debugging, a floating toggle
        button for enabling or disabling tracking, and automatic script injection for effortless
        setup. Whether you're creating assistive interfaces, enhancing readability, or experimenting
        with futuristic interaction patterns, EyeUX makes it easy to turn eye movement into
        meaningful control.
      </SubText>
      <DemoImg src="/start.png" />
    </GettingStartBlcok>
  );
};

export default GettingStart;
