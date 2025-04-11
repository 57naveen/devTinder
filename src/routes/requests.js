const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


//This API for send the connection request 
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; //get the fromUserId  from req
      const toUserId = req.params.toUserId; //get the toUserId from the URL
      const status = req.params.status; //get the status from the URL

      //This is condition checking the API URL should send the only allowedStatus from the URL
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type : " + status });
      }

      //Checking the user is exist in the DB
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // This condition checking user not allowed to send the connection request for the same user
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists" });
      }

      //Creating the instance to the DB
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      //save the data into the DB
      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (error) {
      res.status(400).send("Error : " + error.message);
    }
  }
);


//This API for accept or reject the connection request 
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      //Get the loggedUser from the UserAuth middleware
      const loggedInUser = req.user;

      //get the status and requestId from the URL
      const { status, requestId } = req.params;

      //Checking only allowed status from the URL request
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed" });
      }

      //find the user with some condition
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      //After all check then set the status in the DB
      connectionRequest.status = status;

      //save the DB
      const data = await connectionRequest.save();

      res.json({ message: "Connection Request " + status, data });
    } catch (error) {
      res.status(400).send("Error : " + error.message);
    }
  }
);

module.exports = requestRouter;
