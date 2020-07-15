const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose');
const mongodb = require('mongodb');

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
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/imageUploads-template',
// {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true,
// });
// configure using mongodb npm
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}, (err, client) => {
  if(err) return console.log(err);
  db = client.db('imageupload-multer');
  app.listen(3000, () => {
    console.log('mongodb listening at 3000');
  });
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

// image upload to mongodb
app.post('/uploadphoto', upload.single('myImage'), (req, res) => {
  const img = fs.readFileSync(req.file.path);
  const encode_image = img.toString('base64');
  // define the json object for image
  const finalImage = {
    // takes 3 properties
    contentType: req.file.mimetype,
    path: req.file.path,
    image: new Buffer(encode_image, 'base64'),
  };
  // insert into database
  db.collection('imageupload-multer').insertOne(finalImage, (err, result) => {
  if(err) return console.log('error', err);

  console.log('saved to database', result);

  res.contentType(finalImage.contentType);
  res.send(finalImage.image);
})

})

// configure routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.listen(5000, () => {
  console.log('server listening on PORT: 5000');
});
