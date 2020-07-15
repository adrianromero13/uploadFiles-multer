const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

// configure routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.listen(5000, () => {
  console.log('server listening on PORT: 5000');
});
