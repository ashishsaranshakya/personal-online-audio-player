const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const fs = require('fs');
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-ashish:hotel9ervictor@web-test-projects.bwuoqdk.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
const mongodbHandler = require('./mongodbHandler.js');
const userSchema = require('../models/mongodbSchema.js').userSchema;
const User = mongoose.model("User", userSchema);

// Setting up firebase storage 
var serviceAccount = require("../serviceAccountKey.json");
const firebaseConfig = { 
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://audio-server-3b3ec.appspot.com'
};
admin.initializeApp(firebaseConfig);
const storage = admin.storage();
const bucket=storage.bucket();

let googleId = null;

//Setting up google cloud to retrive signed backlink to file for reference
const googleStorage = new Storage({ 
    credential: admin.credential.cert(serviceAccount),
    projectId: 'audio-server-3b3ec'
});

async function uploadFiles(files, res, user) {
  //username=user;
  User.findOne({accessToken:user})
    .then(result=>{
      googleId = result.googleId;
      upload(files, res)
    })
    .catch(err=>{
      console.error('Error uploading files:', err);
      res.status(500).json({ error: 'Error uploading file' });
    });
}

async function upload(files, res){
  try{
    await Promise.all(files.map(uploadFile));
    console.log('All files uploaded successfully.');
    res.json({status: 'OK'});
  }
  catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
}

function uploadFile(file) {
    return new Promise((resolve, reject) => {

      const filePath = `uploads/${file.filename}`;
      const destinationPath = googleId + `/${file.originalname}`;
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
        mongodbHandler.insertSongURL(googleId, file.filename, url);
        resolve(url);
      }))
      .catch(error => {
        console.error('Error uploading file:', error);
        reject(error);
      });

    });
}

//export default uploadFiles;
module.exports = {uploadFiles};