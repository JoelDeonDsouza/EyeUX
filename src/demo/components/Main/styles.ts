import styled from 'styled-components';

export const HeroContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  height: 100vh;
  position: relative;
  scroll-snap-align: start;
  @media screen and (max-width: 960px) {
    display: flex;
    flex-direction: column;
    height: auto;
  }
`;

export const NavContainer = styled.div`
  display: flex;
  width: 18%;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: 960px) {
    width: 100%;
    padding: 10px 0px;
  }
`;

export const NavBoxWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow:
    rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
    rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  @media screen and (max-width: 960px) {
    height: auto;
    width: 95%;
  }
`;

export const LogoTextBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  cursor: pointer;
  padding: 0 15px;
  margin-bottom: 20px;
`;

export const LogoImg = styled.img`
  width: 50px;
  height: 50px;
`;

export const HeroText = styled.span`
  color: #000;
  opacity: 0.8;
  font-size: 26px;
  font-weight: 700;
  @media screen and (max-width: 960px) {
    font-size: 28px;
    font-weight: 700;
  }
`;

export const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  @media screen and (max-width: 960px) {
    display: none;
  }
`;

export const NavItem = styled.li`
  width: 100%;
  flex: 1;
  display: flex;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  &:last-child {
    border-bottom: none;
  }
`;

export const NavLink = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    color: #0abab5;
    background-color: rgba(0, 123, 255, 0.05);
  }
  &:active {
    background-color: rgba(0, 123, 255, 0.1);
  }
`;

// Main //
export const BlockMainContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow-y: auto;
  padding: 45px 20px;
  box-sizing: border-box;
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  @media screen and (max-width: 960px) {
    padding: 0px;
  }
`;

export const GettingStartBlcok = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
  @media screen and (max-width: 960px) {
    padding: 15px;
  }
`;

export const HeaderText = styled.span`
  color: #000;
  opacity: 0.8;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 18px;
  line-height: 1.4em;
  @media screen and (max-width: 960px) {
    font-size: 28px;
    font-weight: 700;
  }
`;

export const SubText = styled.span`
  color: #000;
  opacity: 0.8;
  font-size: 15px;
  line-height: 2.5;
  letter-spacing: 0.12rem;
  padding: 0px 10px;
  text-align: justify;
  @media screen and (max-width: 960px) {
    font-size: 16px;
  }
`;

export const DemoImg = styled.img`
  width: 100%;
  height: 100%;
  margin-top: 30px;
  border-radius: 20px;
  box-shadow:
    rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset,
    rgba(0, 0, 0, 0.9) 0px 0px 0px 1px;
`;

export const InstallationBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
  @media screen and (max-width: 960px) {
    padding: 15px;
  }
`;

export const CodeWrapper = styled.div`
  position: relative;
  margin: 1rem 0;
`;

export const CodeBlock = styled.pre`
  background-color: #1e1e1e;
  color: #dcdcdc;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  overflow-x: auto;
`;

export const CopyButton = styled.button`
  position: absolute;
  top: 30px;
  right: 8px;
  background-color: #2d2d2d;
  color: #fff;
  border: none;
  padding: 4px 8px;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #444;
  }
`;

export const ComponentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
  @media screen and (max-width: 960px) {
    padding: 15px;
  }
`;

export const GithubWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
  @media screen and (max-width: 960px) {
    padding: 15px;
  }
`;
