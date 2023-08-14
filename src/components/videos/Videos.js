import React, { useEffect, useState } from 'react';
import '../news/News.css'; // Certifique-se de atualizar o nome do arquivo CSS, se necessário
import { Card, Image, Text, Badge, Button, Modal, ScrollArea, Box } from '@mantine/core';
import fetchVideos from './fetchVideos'; // Certifique-se de ajustar o caminho conforme necessário

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const videosFromApi = await fetchVideos();
            setVideos(videosFromApi);
        }

        fetchData();
    }, []);

    const handleOpenModal = (video) => {
        setSelectedVideo(video);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <Box>
            <div>
                <Badge
                    color="gray"
                    variant="light"
                    style={{ fontSize: 10, padding: '5px 10px', marginLeft: 16, marginTop: 16 }}
                >
                    {videos.length}  vídeo(s) disponível(s).
                </Badge>
            </div>
            <Card>
                <div className="news-container">
                    <div style={{ display: 'flex', overflowX: 'auto', padding: '0px' }}>
                        {videos.map((video) => (
                            <Card
                                key={video.title}
                                shadow="sm"
                                padding="lg"
                                radius="md"
                                withBorder
                                className="news-card"
                                style={{ flex: '0 0 300px', margin: '10px', display: 'flex', flexDirection: 'column' }}
                            >
                                <Card.Section component="a" href={video.videoLink}>
                                    <Image src={video.thumbnail} height={160} alt={video.title} />
                                </Card.Section>

                                <div style={{ flexGrow: 1 }}>
                                    <Text weight={500} className="news-title">{video.title}</Text> {/* Mantém a mesma classname do CSS */}
                                    <div>
                                        <Badge color="blue" variant="light" style={{ fontSize: 8, padding: '2px 6px' }}>
                                            Escola Invest
                                        </Badge>
                                        <Badge color="pink" variant="light" style={{ fontSize: 8, padding: '2px 6px' }}>
                                            You Tube
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="light"
                                    color="blue"
                                    fullWidth
                                    mt="md"
                                    radius="md"
                                    style={{ textAlign: 'center' }}
                                    onClick={() => handleOpenModal(video)}
                                >
                                    Assistir agora
                                </Button>
                            </Card>
                        ))}
                    </div>
                    <Modal
                        opened={showModal}
                        onClose={handleCloseModal}
                        title={selectedVideo ? selectedVideo.title : ''}
                        size="lg"
                        scrollAreaComponent={ScrollArea.Autosize}
                        style={{ overflowX: 'hidden' }}
                    >
                        {selectedVideo && (
                            <iframe
                                id="player"
                                src={selectedVideo.videoLink}
                                style={{ width: '100%', height: '500px', border: 'none', overflowX: 'hidden' }}
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            />
                        )}
                    </Modal>

                </div>
            </Card>
        </Box>
    );
};

export default Videos;
