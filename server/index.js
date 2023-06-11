require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const firebaseFileHandler = require('./services/firebaseFileHandler.js');
const mongodbHandler = require('./services/mongodbHandler.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Setting up session to differentiate between user requests
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-ashish:hotel9ervictor@web-test-projects.bwuoqdk.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = require('./models/mongodbSchema.js').userSchema;
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/user",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id,
      name: profile.displayName,
      accessToken: accessToken,
      songList: []
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Setting up multer to store at destination and use original filename
const multerStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      // Preserve the original filename
      cb(null, file.originalname);
    }
  });
const upload = multer({ storage: multerStorage });

app.get("/user/:username", (req,res)=>{
  res.redirect("http://localhost:3000/?token=" + req.params.username);
})

app.get("/songs", (req,res)=>{
  mongodbHandler.getSongList(req.headers.authorization, res);
})

app.get("/user", (req,res)=>{
  if (req.isAuthenticated()){
    res.redirect("/user/" + req.user.googleId);
  } else {
    res.redirect("/login");
  }
})

app.post('/upload', upload.array('file'), (req, res) => {
    if (!req.files) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    //uploading all files asynchronously
    const files=req.files;
    firebaseFileHandler.uploadFiles(files, res, req.headers.authorization);
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/user",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication
    res.redirect("/user/" + req.user.accessToken);
  }
);

app.get("/login", function(req, res){
  res.redirect("/auth/google");
});

app.get("/logout", function(req, res){
  req.logout(function(){
    console.log("Logout");
    User.findOne({accessToken:req.headers.authorization})
      .then((result)=>{
        result.accessToken=null;
        result.save()
          .then((result)=>{
            res.send({done: true});
          })
          .catch((err)=>{
            console.log(err);
          });
      })
      .catch((err)=>{
        console.log(err);
      });
  });
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
