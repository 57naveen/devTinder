const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth")

const app = express();

//Middlewares
app.use(express.json()); //This the middleware for convert the json data
app.use(cookieParser()); //This middleware used for cookies

// API for User sign up
app.post("/signup", async (req, res) => {
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

    await user.save();
    res.send("User Added Successfully!");
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

// API for login
app.post("/login", async (req, res) => {
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
      res.cookie("token", token);

      res.send("Login Successfull!!!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("Error : " + error.message);
  }
});

//Get the profile API
app.get("/profile", userAuth, async (req, res) => {
  try {

    //now getting user ID from the auth middileware through the request 
    const user = req.user

    // console.log(cookies);
    res.send(user);
  } catch (error) {
    res.status(400).send("Error :  " + error.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async(req,res)=>{

  const user = req.user

  res.send(user.firstName + " sending the connection request ")

})


connectDB()
  .then(() => {
    console.log("Database connected successfully...");

    //start the server only after DB connected
    app.listen(5555, () => {
      console.log("Server is running in the port 5555");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!!");
  });
