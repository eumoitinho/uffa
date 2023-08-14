import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './News.css';
import { Card, Image, Text, Badge, Button, Group, Modal, ScrollArea, Container } from '@mantine/core';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const apiKey = '989d4c7975e5fb28c0da6d6528e3c58e';
    const apiUrl = `https://gnews.io/api/v4/top-headlines?category=business&country=br&token=${apiKey}`;

    axios
      .get(apiUrl)
      .then((response) => {
        setArticles(response.data.articles);
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
      });
  }, []);

  function calculateReadingTime(text) {
    // Velocidade média de leitura em palavras por minuto
    const wordsPerMinute = 10;

    // Conta o número de palavras no texto
    const wordCount = text.trim().split(/\s+/).length;

    // Calcula o tempo estimado de leitura em minutos
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return readingTime;
  }

  function formatTimeSincePublication(publishedAt) {
    const now = new Date();
    const publicationDate = new Date(publishedAt);
    const timeDifference = now - publicationDate;
    const minutes = Math.floor(timeDifference / 60000); // 1 min = 60000 ms
    const hours = Math.floor(minutes / 60);

    if (minutes <= 10) {
      return 'Novo!';
    } else if (hours < 24) {
      return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
    } else {
      const day = publicationDate.getDate();
      const month = publicationDate.getMonth() + 1;
      const year = publicationDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <Container>
      <Badge
          color="gray"
          variant="light"
          radius="xl"
          style={{ fontSize: 20, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
        >
          Notícias
          </Badge>
          <div>
        <Badge
          color="gray"
          variant="light"
          style={{ fontSize: 10, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
        >
          {articles.length} notícia(s) encontrada(s).
        </Badge>
      </div>
      <Card style={{padding: '2px 6px', marginLeft: 4, marginTop: 16 }}>
    <div className="news-container">
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarColor: 'black',padding: '10px' }}>
        {articles.map((article) => (
          console.log(article.content),
          <Card
            key={article.title}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="news-card"
            style={{ flex: '0 0 300px', margin: '10px', display: 'flex', flexDirection: 'column' }}
          >
            <Card.Section component="a" href={article.url}>
              <Image src={article.image} height={160} alt={article.title} />
            </Card.Section>

            <div style={{ flexGrow: 1 }}>
              <Group position="apart" mt="md" mb="xs">
                <Text weight={500} className="news-title">{article.title}</Text>
                <div>
                  <Badge color="pink" variant="light" style={{ fontSize: 8, padding: '2px 6px' }}>
                    {formatTimeSincePublication(article.publishedAt)}
                  </Badge>
                  <Badge color="blue" variant="light" style={{ fontSize: 7, padding: '2px 6px', marginLeft: 4 }}>
                    {article.source.name}
                  </Badge>
                  <Badge color="green" variant="light" style={{ fontSize: 8, padding: '2px 6px', marginLeft: 4 }}>
                    {calculateReadingTime(article.content)} min leitura
                  </Badge>
                </div>
              </Group>

              <Text size="sm" color="dimmed" className="news-description">
                {article.description}
              </Text>
            </div>
            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              radius="md"
              style={{ textAlign: 'center' }}
              onClick={() => handleOpenModal(article)}
            >
              Ler agora
            </Button>
          </Card>
        ))}
      </div>
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title={selectedArticle ? selectedArticle.source.name : ''}
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
        style={{ overflowX: 'hidden' }}
      >
        {selectedArticle && (
          <iframe
            src={selectedArticle.url}
            style={{ width: '100%', height: '500px', border: 'none', overflowX: 'hidden' }}
            sandbox="allow-same-origin "
          />
        )}
      </Modal>
    </div>
    </Card>
    </Container>
  );
};

export default News;
