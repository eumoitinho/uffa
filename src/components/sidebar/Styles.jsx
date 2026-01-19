import styled from 'styled-components';

export const Container = styled.div`
  background: linear-gradient(180deg, #1a1b1e 0%, #25262b 100%);
  position: fixed;
  height: 100%;
  top: 0px;
  left: 0px;
  width: 280px;
  left: ${props => props.sidebar ? '0' : '-100%'};
  animation: showSidebar .3s ease-out;
  z-index: 1000;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);

  > svg {
    position: absolute;
    color: rgba(255, 255, 255, 0.7);
    width: 24px;
    height: 24px;
    top: 24px;
    right: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 4px;
    border-radius: 6px;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  @keyframes showSidebar {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const Content = styled.div`
  margin-top: 80px;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
