const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection request for the loggesIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    //note : populate used to get the data from the other table like refering from another table

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send("Error :" + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// User should see all the user cards except
// 1.his own card
// 2.his connections
// 3.ignored people
// 4.already sent the connection request
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    //find all connection requests (sent + received)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    //note : set() data structure always contain unqiue value if you sending same vale it will just ignored
    const hideUSerFromFeed = new Set();

    //loop through all data from the connectionRequests and push into the set()
    connectionRequests.forEach((req) => {
      hideUSerFromFeed.add(req.fromUserId.toString());
      hideUSerFromFeed.add(req.toUserId.toString());
    });

    //makeing the call and find the user with two condition
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUSerFromFeed) } }, //condition for not in the hideUserFromFeed
        { _id: { $ne: loggedInUser._id } }, //Not equal to loogedInUser
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    //note: ($nin) - notIn , ($ne) -  not equal

    res.send(users);
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

module.exports = userRouter;
