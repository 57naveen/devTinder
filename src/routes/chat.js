const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:toTargetedUserId", userAuth, async (req, res) => {
  const { toTargetedUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, toTargetedUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, toTargetedUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.log(error);
  }
});

module.exports = chatRouter;
