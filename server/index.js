const admin = require('firebase-admin');
const fs = require('fs');
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
// const upload = multer({ dest: 'uploads/' });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

var serviceAccount = require("./serviceAccountKey.json");
const firebaseConfig = { 
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://audio-server-3b3ec.appspot.com'
};

admin.initializeApp(firebaseConfig);
const storage = admin.storage();
const bucket=storage.bucket();

const username = 'admin';

const multerStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      // Preserve the original filename
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: multerStorage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const filePath = `uploads/${file.filename}`;
    const destinationPath = username + `/${file.originalname}`;
  
    bucket.upload(filePath, {
      destination: destinationPath,
      metadata: {
        contentType: file.mimetype,
      },
    })
      .then(() => {
        fs.unlinkSync(filePath);
        res.json({ message: 'File uploaded successfully', filePath: destinationPath });
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
      });
  });

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
