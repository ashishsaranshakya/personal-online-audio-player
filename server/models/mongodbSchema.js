const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
mongoose.connect("mongodb+srv://admin-ashish:hotel9ervictor@web-test-projects.bwuoqdk.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const songURLSchema = new mongoose.Schema ({
    name: String,
    url: String
});

const userSchema = new mongoose.Schema ({
    googleId: String,
    name: String,
    accessToken: String,
    songList: [songURLSchema]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = {songURLSchema, userSchema};