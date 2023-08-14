import React, { useEffect, useState } from 'react'
import {useNavigate } from 'react-router-dom';
import { Container, Content } from './Styles'
import { 
  FaTimes, 
  FaHome, 
  FaSignOutAlt,
  FaRegNewspaper,
  FaBook
} from 'react-icons/fa'

import SidebarItem from '../sidebaritem/SidebarItem.jsx'
import SidebarProfile from '../sidebarprofile/SidebarProfile';
import { getUserNameFromFirebase, getUserProfilePhoto } from '../../services/firebaseService';
const user = JSON.parse(localStorage.getItem("user"));


const Sidebar = ({ active }) => {

  const closeSidebar = () => {
    active(false)
  }
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [userName, setUserName] = useState();

  useEffect(() => {
    // Obtenha o URL da foto do perfil do usuário ao montar o componente
    const fetchUserProfile = async () => {
      const photoUrl = await getUserProfilePhoto(user.id);
      const userName = await getUserNameFromFirebase(user.id);
      setProfilePhotoUrl(photoUrl);
      setUserName(userName);
    };
    fetchUserProfile();
  }, []);

  

  return (
    <Container sidebar={active}>
      <FaTimes onClick={closeSidebar} />  
      <Content>
        <SidebarProfile User={userName} ProfilePhoto={profilePhotoUrl} to="/EditProfile"/>
        <SidebarItem Icon={FaHome} Text="Home" to="/"/>
        <SidebarItem Icon={FaBook} Text="Educação" to="/Education"/>
        <SidebarItem Icon={FaRegNewspaper} Text="Notícias" to="/NewsIndex"/>
        <SidebarItem Icon={FaSignOutAlt} Text="Logout" isLogout={true} />
      </Content>
    </Container>
  )
}

export default Sidebar