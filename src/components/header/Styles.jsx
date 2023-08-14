import {styled} from 'styled-components';

export const Container = styled.div`
  height: 100px;
  display: flex;
  background-color: #f5f5f5; 

  z-index: 2;

  > svg {
    color: black;
    width: 25px;
    height: 25px;
    margin-top: 50px;
    margin-left: 32px;
    cursor: pointer;
  }
`;

export const LogoContainer = styled.div`
  margin: auto;
  margin-top: 25px;
  position: relative;
  width: 100px;
  height: 100px;
  align-items: center;
  justify-content: center;

`;