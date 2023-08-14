import React, { useState, useEffect } from 'react';
import { Card, Text, Badge, Button, Box, Container, Image } from '@mantine/core';
import Header from '../components/header/Header';
import { cardData } from '../components/data/educationData';
import FiltersEducation from '../components/filters/FiltersEducation';
import { Modal, Group, ScrollArea } from '@mantine/core';
import Videos from '../components/videos/Videos';

function Education() {
  const [sidebar, setSidebar] = useState(false);
  const [filteredCards, setFilteredCards] = useState([]);
  const [subjectCounts, setSubjectCounts] = useState({});
  const [filters, setFilters] = useState({
    subject: "all",
  });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Filtrar os cards com base no assunto selecionado em filters.subject
    if (filters.subject === 'all') {
      setFilteredCards(cardData);
    } else {
      const filtered = cardData.filter((card) => card.badge === filters.subject);
      setFilteredCards(filtered);
      const counts = filtered.reduce((acc, filtered) => {
        const { badge } = filtered;
        acc[badge] = (acc[badge] || 0) + 1;
        return acc;
      }, {});
      setSubjectCounts(counts);
    }
  }, [filters.subject]);

  // Função para abrir o modal com o iframe ao clicar no botão "Ler agora"
  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Box>
      <Header sidebar={sidebar} setSidebar={setSidebar} />
      <Container>
      <Badge
          color="gray"
          variant="light"
          radius="xl"
          style={{ fontSize: 20, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
        >
          Artigos
          </Badge>
      <div style={{ padding: '2px 15px', marginLeft: 4 }}>
        <FiltersEducation setFilters={setFilters} filters={filters} />
      </div>
      <div>
        <Badge
          color="gray"
          variant="light"
          style={{ fontSize: 10, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
        >
          {filters.subject === 'all' ? filteredCards.length : subjectCounts[filters.subject] || 0} artigo(s) encontrado(s).
        </Badge>
      </div>
      <Card>
        <div className="news-container">
          <div style={{ display: 'flex', overflowX: 'auto', padding: '0px' }}>
            {filteredCards.map((card) => (
              <Card
                key={card.title}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="news-card"
                style={{ flex: '0 0 300px', margin: '10px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ flexGrow: 1 }}>
                  <Text weight={500} className="news-title">
                    {card.title}
                  </Text>
                  <div>
                    <Badge color="blue" variant="light" style={{ fontSize: 6, padding: '2px 6px', marginLeft: 4 }}>
                      Educa Mais Brasil
                    </Badge>
                    <Badge
                      color="green"
                      variant="light"
                      style={{ fontSize: 6, padding: '2px 6px', marginLeft: 4 }}
                    >
                      {`5 min de leitura`}
                    </Badge>
                    <Badge
                      color="green"
                      variant="light"
                      style={{ fontSize: 6, padding: '2px 6px', marginLeft: 4 }}
                    >
                      {card.badge}
                    </Badge>
                  </div>

                  <Text size="sm" color="dimmed" className="news-description">
                    {card.description}
                  </Text>
                </div>
                {/* Botão "Ler agora" que abre o modal */}
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  style={{ textAlign: 'center' }}
                  onClick={() => handleOpenModal(card.link)}
                >
                  Ler agora
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Renderizar o modal com o iframe */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title="Educa Mais Brasil"
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
          {selectedArticle && (
            <iframe
              src={selectedArticle}
              style={{ width: '100%', height: '500px', border: 'none' }}
            />
          )}
      </Modal>
      </Container>
      <Container>
      <Badge
          color="gray"
          variant="light"
          radius="xl"
          style={{ fontSize: 20, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
        >
          Vídeos
          </Badge>
      <Videos/>
      </Container>
    </Box>
  );
}

export default Education;
