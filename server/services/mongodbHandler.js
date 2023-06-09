const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-ashish:hotel9ervictor@web-test-projects.bwuoqdk.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const songURLSchema = {
    name: String,
    url: String
};
const SongURL = mongoose.model("SongURL", songURLSchema);

const userSchema = {
  name: String,
  songList: [songURLSchema]
};
const User = mongoose.model("User", userSchema);


function insertSongURL(user, fileName, newURL){

  const songURL = new SongURL({
    name: fileName,
    url: newURL
  });

  User.findOne({name: user})
    .then((result)=>{
      result.songList.push(songURL);
      result.save()
      .then(result => console.log(result))
      .catch(err => console.log(err));
    })
    .catch((err)=>{
      console.log(err);
    });

}

function getSongList(user, res){
  User.findOne({name: user})
    .then((result)=>{
      res.json(result);
    })
    .catch((err)=>{
      console.log(err);
    });
}

//export default insertSongURL;
module.exports = {insertSongURL, getSongList};