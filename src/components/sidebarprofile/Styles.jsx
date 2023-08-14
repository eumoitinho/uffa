import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #1A202C; 
  font-size: 20px;
  color: white;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  margin: 0 15px 20px;
  z-index: 2;

  > div {
    display: flex;
    align-items: center;
    flex: 1; /* Ocupa todo o espaço disponível */

    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px; /* Espaçamento entre a foto e o nome */
    }

    p {
      margin: 0; /* Remove margem padrão do parágrafo */
      margin-left: 10px; /* Espaçamento entre o nome e o ícone */
    }
  }

  &:hover {
    background-color: black;
  }
`;
