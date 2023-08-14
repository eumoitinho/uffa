import React, { useState } from 'react';
import News from '../components/news/News'; // Certifique-se de que o caminho do arquivo está correto
import Header from '../components/header/Header';
import { Card } from '@mantine/core';

function NewsIndex() {
  const [sidebar, setSidebar] = useState(false);
  return (
    <div>
      <Header sidebar={sidebar} setSidebar={setSidebar}/>
      <Card>
      <News />
      </Card>
    </div>
  );
}

export default NewsIndex;
