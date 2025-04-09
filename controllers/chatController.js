const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Users = require("../models/Users");
const Chat = require("../models/Chats");

exports.sendMessage = async (req, res) => {
  const { message, senderType } = req.body; // Ensure req has chatId and message
  const userId = req.user.id; // Assumes you have middleware that sets req.user

  try {
    const newMessage = await Chat.create({
      // The chat session ID
      userId: userId, // The ID of the sender
      from: senderType, // User or agent
      message: message, // The message text
    });

    res.status(201).json({ message: "Message sent", message: newMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    res
      .status(500)
      .json({ message: "Failed to send message", error: error.message });
  }
};
exports.getUserChats = async (req, res) => {
  const userId = req.user.id; // Assumes authentication middleware

  try {
    const chats = await Chat.findAll({ where: { userId } });
    res.json({ chats, message: "Chats retrieved" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting chats", error: error.message });
  }
};
