const jwt = require("jsonwebtoken");
const User = require("../db/models/user.model");
const SECRET = process.env.SECRET || "DEVish-Secret";
const tokenRegex = /\S+\.\S+\.\S+/;

const authMiddleware = async (req, res, next) => {
  const { headers } = req;
  const { authorization } = headers;

  const authorizationSplitted = authorization.split(" ");

  if (
    authorizationSplitted[0] === "Bearer" &&
    tokenRegex.test(authorizationSplitted[1])
  ) {
    return jwt.verify(
      authorizationSplitted[1],
      SECRET,
      { algorithms: ["HS256"] },
      async (err, decoded) => {
        if (err) {
          if (err.message === "jwt expired") {
            return res
              .status(401)
              .json({ success: false, message: err.message });
          }
          return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
        }

        if (!decoded.sub) {
          return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
        }

        try {
          const user = await User.findById(decoded.sub);
          if (!user) {
            return res
              .status(401)
              .json({ success: false, message: "Unauthorized" });
          }

          req.user = user;

          return next();
        } catch (error) {
          return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
        }
      }
    );
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
};

module.exports = authMiddleware;
