const { Router } = require("express");
const User = require("../db/models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const passwordRegex = new RegExp(
  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
);
const SECRET = process.env.SECRET || "DEVish-Secret";

const ROUNDS = 12;

const router = Router();

router.post("/sign-up", async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    if (!emailValidator.validate(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email" });
    }

    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: "Password too weak" });
    }

    let hash = "";
    try {
      hash = await bcrypt.hash(password, ROUNDS);
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }

    try {
      const user = new User({ email, password: hash });
      const userSaved = await user.save();

      return jwt.sign(
        {},
        SECRET,
        {
          algorithm: "HS256",
          subject: userSaved._id.toString(),
          expiresIn: "14 days",
        },
        (err, encoded) => {
          console.log(err);
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Something went wrong" });
          }

          return res.status(200).json({
            success: true,
            message: "User successfully created",
            user: { email: userSaved.email },
            accessToken: encoded,
          });
        }
      );
    } catch (error) {
      if (error.message.includes("duplicate key error collection")) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }
      return res
        .status(500)
        .json({ success: false, message: "User creation failed" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }
});

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
      try {
        const isPasswordValid = await bcrypt.compare(
          password,
          userFromDB.password
        );
        if (isPasswordValid) {
          return jwt.sign(
            {},
            SECRET,
            {
              algorithm: "HS256",
              subject: userFromDB._id.toString(),
              expiresIn: "14 days",
            },
            (err, encoded) => {
              if (err) {
                return res
                  .status(500)
                  .json({ success: false, message: "Something went wrong" });
              }

              return res.status(200).json({
                success: true,
                message: "User successfully authenticated",
                user: { email: userFromDB.email },
                accessToken: encoded,
              });
            }
          );
        } else {
          return res.json({
            success: false,
            message: "Email or Password invalid",
          });
        }
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Email or Password invalid" });
      }
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Email or Password invalid" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
