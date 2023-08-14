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
  margin-left: 88px;
  margin-top: 30px;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;

`;