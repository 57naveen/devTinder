const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validataEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();

//Get the profile API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    //now getting user ID from the auth middileware through the request
    const user = req.user;

    // console.log(cookies);
    res.send(user);
  } catch (error) {
    res.status(400).send("Error :  " + error.message);
  }
});

// Edit Profile API 
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validataEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    //This data from the userAuth middleware
    const loggedInUser = req.user;
    console.log(loggedInUser);

    //Loop through all the field coming form the req.body and update the field in loggedInUSer
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    console.log(loggedInUser);

    //save the data in DB
    await loggedInUser.save()

   res.json({
    message:`${loggedInUser.firstName}, Your profile updated successfuly`,
    data: loggedInUser,
   })
    
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

module.exports = profileRouter;
