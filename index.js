const express = require('express');
const config = require('./config');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const fakeHMR = require('./fake-hmr');
const fs = require('fs');
const compiler = webpack(webpackConfig);

const watching = compiler.watch({
  // Example watchOptions
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => { // Stats Object
  console.log(stats.toString({
    chunks: false,  // Makes the build much quieter
    colors: true    // Shows colors in the console
  }))
  if (stats.hasErrors()) {
    console.log('didn\' t build')
    return;
  }
  console.log('built');
  fakeHMR.built();
});

const app = express();
fakeHMR.config({ app });
app.use(express.json())
app.use(express.static('public'));
// require('./webpackRunner');

// Codigo criado
let anime;
//Escrita de arquivo JSON
function writeJson() {
  fs.writeFileSync(__dirname + '/animes.json', JSON.stringify(anime))
  console.log("Arquivo JSON atualizado!")
}
//Leitura de arquivo JSON
function getAnime() {
  anime = JSON.parse(fs.readFileSync(__dirname + '/animes.json', 'utf-8'))
}

//Adiciona novas informações
function postAnime(animeData) {
  anime.animes.push(
    animeData
  )
  console.log(anime)
  writeJson();
}

//Atualiza os dados de acordo com o id econtrado
function putAnime(animeData, id) {
  anime.animes = anime.animes.map(el => {
    console.log(el.id)
    if (el.id === id) {
      console.log('teste')
      return animeData
    }
    return el
  });
  console.log(anime)
  writeJson();
}

//Busca o id numa lista e retorna uma lista sem ele
function deleteAnime(id) {
  anime.animes = anime.animes.filter(el => { return id !== el.id })
  writeJson();
}

app.get('/', (req, res) => {
  getAnime();
  res.json(anime);
});

app.post('/', (req, res) => {
  getAnime();
  postAnime(req.body);
  res.status(200).send("Adicionado com sucesso");
})

app.put('/:id', (req, res) => {
  getAnime();
  putAnime(req.body, req.params.id);
  res.status(200).send("Editado com sucesso");
})

app.delete('/:id', (req, res) => {
  getAnime();
  deleteAnime(req.params.id);
  res.status(200).send("Deletado com sucesso");
})

app.get('/season', (req, res) => {
  fs.readFile(__dirname + '/animes-season.json', 'utf-8', (err, data) => {
    if (err) {
      throw err;
    }
    res.status(200).json(
      JSON.parse(data)
    )
  })
});

app.listen(config.PORT, function() {
  console.log(`App currently running; navigate to localhost:${config.PORT} in a web browser.`);
});
