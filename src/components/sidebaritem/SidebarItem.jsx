import React from 'react'
import { Container } from './Styles'
import {useNavigate } from 'react-router-dom';
import { HideLoading, ShowLoading } from '../../redux/alertsSlice'
import { useDispatch } from 'react-redux'
import { notifications } from '@mantine/notifications';

const SidebarItem = ({ Icon, Text, to, isLogout }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleItemClick = () => {
    if (isLogout) {
      // Realizar o logout
      dispatch(ShowLoading());
      setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('needsOnboarding');
        dispatch(HideLoading());
        navigate('/login');
      }, 300);
      notifications.show({
        // Exibe uma notificação de logout
        id: 'Logout',
        message: 'Logout realizado com sucesso!',
        color: 'green',
      });
    } else {
      // Navegar para a página correspondente
      navigate(to);
    }
  };

  return (
    <Container onClick={handleItemClick}>
      <Icon />
      {Text}
    </Container>
  );
};

export default SidebarItem
