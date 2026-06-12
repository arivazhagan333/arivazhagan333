const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
mongoose.set('strictQuery', false);

const UserSchema = new mongoose.Schema({
    username:String,
    password:String,
   
}) ;
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Users",UserSchema);