const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            message: "Token Missing"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,

        (err, decoded) => {

            if (err) {

                return res.status(403).json({
                    message: "Access Token Expired"
                });
            }

            req.user = decoded;

            next();
        }
    );
}

module.exports = verifyToken;