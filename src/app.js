const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

//This the middleware for convert the json data
app.use(express.json());

// API for User sign up
app.post("/signup", async (req, res) => {
  // Creating a new instance of the User model
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User Added Successfully!");
  } catch (error) {
    res.status(400).send("Error saving the user:" + error.message);
  }
});

//Get user by emailId
app.get("/user", async (req, res) => {
  const email = req.body.emailId;

  try {
    const user = await User.find({ emailId: email });

    if (user.length > 0) {
      res.send(user);
    } else {
      res.status(400).send("User not Found");
    }
  } catch (error) {
    res.status(400).send("Something went wrong !");
  }
});

//Feed API - GET/feed - get all the user from the database
app.get("/feed", async (req, res) => {
  try {
    //This empty '{}' object will get the all the user from the database
    const users = await User.find({});

    res.send(users);
  } catch (error) {
    res.status(400).send("Something Went wrong !");
  }
});

//Delete the user by id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);

    res.send("User deleted successfully...");
  } catch (error) {
    res.status(400).send("Something went wrong!!!");
  }
});

//Update user API
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["PhotoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) => {
      ALLOWED_UPDATES.includes(k);
    });

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    
    //validation for skills field 
    if(data?.skills.length > 10){
      throw new Error("Skills cannot be more than 10 ")
    }

    await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
    });
    res.send("User Updated Successfully...");
  } catch (error) {
    res.status(400).send("Update Failed : " + error.message);
  }
});

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
