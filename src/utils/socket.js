const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, toTargetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, toTargetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
   path: "/api/socket.io",   // 👈 custom path
    cors: {
      origin: "https://dev-tinder-web-iota-gules.vercel.app",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //Handel events
    socket.on("joinChat", ({ userId, toTargetUserId }) => {
      const roomId = getSecretRoomId(userId, toTargetUserId);

      console.log("Joining room :" + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName,lastName, userId, toTargetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, toTargetUserId);
          console.log(firstName + " " + text);

          //Find the existing users in the DB
          let chat = await Chat.findOne({
            participants: { $all: [userId, toTargetUserId] },
          });

          //If new users the create the db
          if (!chat) {
            chat = new Chat({
              participants: [userId, toTargetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName,lastName, text });
        } catch (error) {
          console.log(error.message);
        }
      }
    );

    socket.on("disconnet", () => {});
  });
};

module.exports = initializeSocket;
