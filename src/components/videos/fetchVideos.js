import axios from 'axios';

function parseISO8601Duration(duration) {
  const match = /PT(\d+H)?(\d+M)?(\d+S)?/.exec(duration);

  if (!match) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}
async function fetchVideos() {
  try {
    const playlistId = 'PLrfk0nlDFiXNUt9zGWoiTTzwb5OqjXu-1';
    const apiKey = 'AIzaSyBgnk4QFRf2lKmwtrfB0RwWu2kPt5yCQ2Q';
    const maxResults = 10;
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet, contentDetails',
        playlistId: playlistId,
        key: apiKey,
        maxResults: maxResults,
      },
    });
    console.log(response);
    const videos = response.data.items.map((video) => {
      const durationInfo = parseISO8601Duration(video.contentDetails.duration);

      return {
        title: video.snippet.title,
        description: video.snippet.description,
        videoLink: `https://www.youtube.com/embed/${video.snippet.resourceId.videoId}`,
        thumbnail: video.snippet.thumbnails.default.url,
        duration: `${durationInfo.hours}:${durationInfo.minutes}:${durationInfo.seconds}`,
        publishedAt: video.snippet.publishedAt,
      };
    });

    return videos;
  } catch (error) {
    console.error('Erro ao obter vídeos da playlist:', error);
    return [];
  }

}

export default fetchVideos;

