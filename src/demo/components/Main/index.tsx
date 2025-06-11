import {
  HeroContainer,
  NavContainer,
  NavBoxWrapper,
  LogoTextBlock,
  LogoImg,
  HeroText,
  NavList,
  NavItem,
  NavLink,
  BlockMainContainer,
} from './styles';

// utilities
import GettingStart from './utilities/GettingStart';
import Installation from './utilities/Installation';
import QuickStart from './utilities/QuickStart';
import GithubRepo from './utilities/GithubRepo';

const NavItems = [
  {
    id: 1,
    name: 'Getting Started',
    tag: '#getting-started',
  },
  {
    id: 2,
    name: 'Installation',
    tag: '#installation',
  },
  {
    id: 3,
    name: 'Quick Start',
    tag: '#start',
  },
  {
    id: 4,
    name: 'Github',
    tag: '#github',
  },
];

const Main = () => {
  const handleScrollToSection = (tag: string) => {
    const element = document.querySelector(tag);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <HeroContainer>
      <NavContainer>
        <NavBoxWrapper>
          <LogoTextBlock>
            <LogoImg src="/logo.png" />
            <HeroText>Eye UX</HeroText>
          </LogoTextBlock>
          <NavList>
            {NavItems.map((item) => (
              <NavItem key={item.id}>
                <NavLink
                  href={item.tag}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection(item.tag);
                  }}
                >
                  {item.name}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </NavBoxWrapper>
      </NavContainer>
      {/* Main */}
      <BlockMainContainer>
        <div id="getting-started">
          <GettingStart />
        </div>
        <div id="installation">
          <Installation />
        </div>
        <div id="start">
          <QuickStart />
        </div>
        <div id="github">
          <GithubRepo />
        </div>
      </BlockMainContainer>
    </HeroContainer>
  );
};

export default Main;
