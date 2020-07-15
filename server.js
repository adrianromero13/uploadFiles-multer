const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// set up middlewares for json use
app.use(bodyParser.urlencoded({ extended: true }));

// utilize multer lib to set up storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
});

// configuring mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/imageUploads-template',
{
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// configure the upload file route
app.post('/uploadfile', upload.single('myFile'),(req,res,next) => {
  const file = req.file;

  if(!file) {
    const error = new Error('please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
})

app.post('/uploadmultiple', upload.array('myFiles', 12), (req,res,next) => {
  const files = req.files;
  if(!files) {
    const error = new Error('Please choose files, max: 12');
    error.httpStatusCode = 400;
    return next(error);
  }
  //if no error
  res.send(files);
})


// configure routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.listen(5000, () => {
  console.log('server listening on PORT: 5000');
});
