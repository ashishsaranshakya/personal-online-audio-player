const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const firebaseFileHandler = require('./services/firebaseFileHandler.js');
const mongodbHandler = require('./services/mongodbHandler.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Setting up multer to store at destination and use original filename
const multerStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      // Preserve the original filename
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: multerStorage });

const username = 'admin';

app.get("/:user", (req,res)=>{
  mongodbHandler.getSongList(req.params.user, res);
})

app.post('/upload', upload.array('file'), (req, res) => {
    console.log(req.files);
    if (!req.files) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    //uploading all files asynchronously
    const files=req.files;
    firebaseFileHandler.uploadFiles(files, res, username);
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
