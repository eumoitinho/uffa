import React from 'react';
import { Container } from './Styles';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/alertsSlice';

const SidebarProfile = ({ User, ProfilePhoto, to }) => {
  // Função para formatar o nome do usuário
  const formatName = (name) => {
    if (!name) return ''; // Caso o nome seja vazio ou nulo, retorna uma string vazia

    const firstLetter = name.charAt(0).toUpperCase(); // Obtém a primeira letra em maiúsculo
    const restOfName = name.slice(1).toLowerCase(); // Obtém o restante do nome em minúsculo

    return firstLetter + restOfName; // Retorna o nome formatado com a primeira letra maiúscula e o resto em minúsculo
  };

  // Formate o nome do usuário antes de exibir
  const formattedUserName = formatName(User);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleItemClick = () => {
    dispatch(ShowLoading());
      navigate(to);
      dispatch(HideLoading());
  };

  return (
    <Container onClick={handleItemClick}>
      <div>
      {ProfilePhoto ? (
          <img src={ProfilePhoto} alt="Foto do perfil" />
        ) : (
          <FaUserCircle size={50} color="gray"/>
        )}
        <p>{formattedUserName}</p>
      </div>
    </Container>
  );
};

export default SidebarProfile;
