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
       src={require("file:///D:/TCC/logo-png.png")}
                    />
      </LogoContainer>
      {sidebar && <Sidebar active={setSidebar} />}
    </Container>
    );
}

export default Header;

/*<div>
            <Card shadow="md" p={20} className="custom-card">
                <div className="flex justify-between">
                    <i className="ri-restart-line" onClick={handleRefreshClick}></i>
                    <Group grow>
                        <Text paddingRight="30px">{user?.name}</Text>
                        <i className="ri-logout-box-r-line" onClick={logOut}></i>
                    </Group>
                </div>
                <div className="flex items-center justify-center">
                    <Image
                        src={require("file:///D:/TCC/logo-png.png")}
                        height={45}
                        width={100}
                        className="mx-auto"
                    />
                </div>
            </Card>
        </div>*/