const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");


const app = express();

//Middlewares
app.use(express.json()); //This the middleware for convert the json data
app.use(cookieParser()); //This middleware used for cookies


const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/requests")


app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);



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
