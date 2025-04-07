const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

// API for User sign up
app.post("/signup", async (req, res) => {

  const userObj = {
    firstName: "Naveen",
    lastName: "Kishore",
    emailId: "naveen57@gmail.com",
    password: "navee123",
  };

  // Creating a new instance of the User model
  const user = new User(userObj);

  try {
    await user.save();
    res.send("User Added Successfully!");
  } catch (error) {
    res.status(400).send("Error saving the user:" + error.message);
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
