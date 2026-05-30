const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");
const verifyToken = require("./middleware/verifyToken");

const app = express();


// DATABASE
connectDB();


// MIDDLEWARE
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static("public"));




// ----------------------------
// ACCESS TOKEN
// ----------------------------

function createAccessToken(user) {

    return jwt.sign(

        {
            id: user._id,
            role: user.role
        },

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: "15s"
        }
    );
}




// ----------------------------
// REFRESH TOKEN
// ----------------------------

function createRefreshToken(user) {

    return jwt.sign(

        {
            id: user._id
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: "1m"
        }
    );
}

// ----------------------------
// REGISTER
// ----------------------------

app.post("/register", async (req, res) => {

    try {

        const { username, password } = req.body;


        const userExists = await User.findOne({ username });

        if (userExists) {

            return res.json({
                message: "User Already Exists"
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({

            username,
            password: hashedPassword
        });


        await newUser.save();


        res.json({
            message: "Registration Success"
        });

    } catch (error) {

        console.log(error);
    }
});






// ----------------------------
// LOGIN
// ----------------------------

app.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;


        const user = await User.findOne({ username });

        if (!user) {

            return res.status(400).json({
                message: "User Not Found"
            });
        }


        const checkPassword = await bcrypt.compare(
            password,
            user.password
        );


        if (!checkPassword) {

            return res.status(400).json({
                message: "Wrong Password"
            });
        }



        // CREATE TOKENS
        const accessToken = createAccessToken(user);

        const refreshToken = createRefreshToken(user);




        // STORE REFRESH TOKEN IN DB
        user.refreshToken = refreshToken;

        await user.save();




        // STORE COOKIE
        res.cookie("refreshToken", refreshToken, {

            httpOnly: true,

            secure: false,

            sameSite: "strict"
        });




        res.json({

            message: "Login Success",

            accessToken
        });

    } catch (error) {

        console.log(error);
    }
});







// ----------------------------
// ADMIN PAGE
// ----------------------------

app.get("/admin", verifyToken, (req, res) => {

    res.json({

        message: "Welcome Admin",

        user: req.user
    });
});







// ----------------------------
// REFRESH TOKEN
// ----------------------------

app.post("/refresh", async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken;


        if (!refreshToken) {

            return res.status(401).json({
                message: "Refresh Token Missing"
            });
        }



        // FIND USER WITH REFRESH TOKEN
        const user = await User.findOne({
            refreshToken
        });


        if (!user) {

            return res.status(403).json({
                message: "Invalid Refresh Token"
            });
        }




        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,

            (err, decoded) => {

                if (err) {

                    return res.status(403).json({
                        message: "Refresh Token Expired Login Again"
                    });
                }



                // CREATE NEW ACCESS TOKEN
                const newAccessToken = createAccessToken(user);



                res.json({
                    accessToken: newAccessToken
                });
            }
        );

    } catch (error) {

        console.log(error);
    }
});








// ----------------------------
// LOGOUT
// ----------------------------

app.post("/logout", async (req, res) => {

    const refreshToken = req.cookies.refreshToken;


    const user = await User.findOne({
        refreshToken
    });


    if (user) {

        user.refreshToken = "";

        await user.save();
    }


    res.clearCookie("refreshToken");


    res.json({
        message: "Logout Success"
    });
});






// ----------------------------
// START SERVER
// ----------------------------

app.listen(process.env.PORT, () => {

    console.log("Server Running");
});