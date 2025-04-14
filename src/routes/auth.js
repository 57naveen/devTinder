const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");


const authRouter = express.Router();


// API for sign up
authRouter.post("/signup", async (req, res) => {
  try {
    //Validate the data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //Encrypting password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

   const savedUser = await user.save();
   const token = await savedUser.getJWT();

   // Add the token to cookie and send the response back to the user
   res.cookie("token", token,{
     expires: new Date(Date.now() + 8 * 3600000)
   });


    res.json({message:"User Added Successfully!",data:savedUser});
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});


// API for login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    //Finding the email is exist in the DB
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    //passing password from req.body and User.password from the DB
    // const isPasswordvalid = await bcrypt.compare(password, user.password);

    const isPasswordvalid = await user.validatePassword(password)

    if (isPasswordvalid) {
      //Create a JWT Token

      //passing userId for hidding inside the token and also passing secret code "NAV@Tinder$8112" (you can enter any code)
      // const token = await jwt.sign({ _id: user._id }, "NAV@Tinder$8112",{
      //   expiresIn:"1d" // expires in 1 day
      // });
      // console.log(token);

      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token,{
        expires: new Date(Date.now() + 8 * 3600000)
      });

      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});


//logout API
authRouter.post("/logout",async (req,res) =>{

  res.cookie("token",null,{
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!")
})


module.exports = authRouter;