const axios = require('axios');
const cheerio = require('cheerio');

const fetchData = async (url) => {
    const result = await axios.get(url)
    return result.data
}

const main = async () => {
    const content = await fetchData('https://www.educamaisbrasil.com.br/enem/educacao-financeira');
    const $ = cheerio.load(content);
    const teste = $('#ConteudoPrincipal > app-disciplina > div.container.conteudo-scroll > app-card-artigos > div:nth-child(2) > div.flex > div:nth-child(1)').text();
    console.log (teste);
}

main();