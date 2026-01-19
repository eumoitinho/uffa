import {styled} from 'styled-components';

export const Container = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 24px;

  > svg {
    color: #1a1b1e;
    width: 22px;
    height: 22px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f4;
      color: #20c997;
    }
  }
`;

export const LogoContainer = styled.div`
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 36px;
    width: auto;
  }
`;
