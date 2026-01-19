import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(32, 201, 151, 0.15) 0%, rgba(32, 201, 151, 0.05) 100%);
  font-size: 14px;
  font-weight: 500;
  color: white;
  padding: 16px;
  cursor: pointer;
  border-radius: 12px;
  margin: 0 0 16px 0;
  border: 1px solid rgba(32, 201, 151, 0.2);
  transition: all 0.2s ease;

  > div {
    display: flex;
    align-items: center;
    flex: 1;

    img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(32, 201, 151, 0.5);
    }

    p {
      margin: 0;
      margin-left: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }
  }

  &:hover {
    background: linear-gradient(135deg, rgba(32, 201, 151, 0.25) 0%, rgba(32, 201, 151, 0.1) 100%);
    border-color: rgba(32, 201, 151, 0.4);
    transform: translateY(-1px);
  }
`;
