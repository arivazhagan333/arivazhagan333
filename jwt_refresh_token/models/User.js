const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String
    },

    password: {
        type: String
    },

    role: {
        type: String,
        default: "admin"
    },

    refreshToken: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("User", userSchema);