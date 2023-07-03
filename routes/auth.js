const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const JWT_SECRET = "mySecretI&MyBussiness@ndNotY0r";

// getting all User with get "api/auth/users" no login required
router.get("/users", async (req, res) => {
  try {
    let allUsers = await User.find();
    res.send(allUsers);
  } catch (error) {
    console.log(error);
  }
});

// Route 1: Creating User with post "api/auth/createuser" no login required
router.post(
  "/createuser",
  [
    body("name", "Enter at least 3charector").isLength({ min: 3 }),
    body("email", "Please Enter a Valid Email").isEmail(),
    body("password", "Password should be at least 5 Charecters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are error return bad request and error
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      // checking if user already exist
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          errors: "sorry a user with this email already exist",
        });
      }

      // Convertin password into a hash form
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      // Creating new user
      user = await User.create({
        name: req.body.name,
        password: hashPassword,
        email: req.body.email,
      });

      // returning authentication Tokens

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send(success, "Internal Server Error");
    }
  }
);

// Route 2: Login User with post "api/auth/loginuser" no login required
router.post(
  "/loginuser",
  [
    body("email", "Please Enter a Valid Email").isEmail(),
    body("password", "Password should no to be blank").exists(),
  ],
  async (req, res) => {
    // if there are error return bad request and error
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // if Checking user exist or not
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success,
          error: "please login with correct email and password",
        });
      }

      // comparing hash pasword with databas
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({
          success,
          error: "please login with correct email and password",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };

      // if Authentication is succesfull then giving them a Authentication token
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send(success, "Internal Server Error");
    }
  }
);

module.exports = router;
