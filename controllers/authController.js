const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Users = require("../models/Users");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Короткий срок действия
  });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      phone: "",
    });
    const token = generateAccessToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
      result: 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, result: 1 });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", result: 1 });
    }
    const token = generateAccessToken(user);
    res.json({ token, user, result: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.authMe = async (req, res) => {
  try {
    if (req.user) {
      const user = await Users.findOne({ where: { id: req.user.id } });
      res.json({ user: user, result: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
