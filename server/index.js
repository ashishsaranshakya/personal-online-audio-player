const admin = require('firebase-admin');
const fs = require('fs');
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Setting up firebase storage 
var serviceAccount = require("./serviceAccountKey.json");
const firebaseConfig = { 
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://audio-server-3b3ec.appspot.com'
};
admin.initializeApp(firebaseConfig);
const storage = admin.storage();
const bucket=storage.bucket();

//Setting up google cloud to retrive signed backlink to file for reference
const googleStorage = new Storage({ 
    credential: admin.credential.cert(serviceAccount),
    projectId: 'audio-server-3b3ec'
});

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

function uploadFile(file) {
    return new Promise((resolve, reject) => {

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
        
        const fileObj = bucket.file(destinationPath);
        const config = {
            action: 'read',
            expires: '03-17-2025', // Set an expiration date
        };
        return fileObj.getSignedUrl(config);
      })
      .then((results=>{
        const url = results[0];
        console.log('File uploaded and available at:', url);
        resolve(url);
      }))
      .catch(error => {
        console.error('Error uploading file:', error);
        reject(error);
      });

    });
  }

async function uploadFiles(files, res) {
    try {
      await Promise.all(files.map(uploadFile));
      console.log('All files uploaded successfully.');
      res.json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  }

app.post('/upload', upload.array('file'), (req, res) => {
    console.log(req.files);
    if (!req.files) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    //uploading all files asynchronously
    const files=req.files;
    uploadFiles(files, res);
  });

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
