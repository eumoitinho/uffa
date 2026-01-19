import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 10px;
  margin: 2px 0;
  transition: all 0.2s ease;

  > svg {
    margin-right: 14px;
    font-size: 18px;
    opacity: 0.8;
    transition: all 0.2s ease;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: white;
    transform: translateX(4px);

    > svg {
      opacity: 1;
      color: #20c997;
    }
  }

  &:active {
    transform: translateX(2px);
    background-color: rgba(255, 255, 255, 0.12);
  }
`;
