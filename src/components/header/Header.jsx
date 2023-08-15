import React, { useState } from 'react'
import { Container,LogoContainer } from './Styles'
import { FaBars } from 'react-icons/fa'
import Sidebar from '../sidebar/Sidebar'
import { Image } from '@mantine/core'


const Header = () => {

    const [sidebar, setSidebar] = useState(false);
    const showSiderbar = () => setSidebar(!sidebar);


    return (
        <Container>
      <FaBars onClick={showSiderbar} />
      <LogoContainer>
      <Image
       src={process.env.PUBLIC_URL + '/logo-png.png'} alt="Logo"
                    />
      </LogoContainer>
      {sidebar && <Sidebar active={setSidebar} />}
    </Container>
    );
}

export default Header;
