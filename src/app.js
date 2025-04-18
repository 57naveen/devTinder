const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const http = require("http")

const app = express();

require("dotenv").config();

//This middleware solve the cors error
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}));

//Middlewares
app.use(express.json()); //This the middleware for convert the json data
app.use(cookieParser()); //This middleware used for cookies


const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/requests")
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter)
app.use("/",chatRouter);


const server = http.createServer(app);

initializeSocket(server)


connectDB()
  .then(() => {
    console.log("Database connected successfully...");

    //start the server only after DB connected
    server.listen(5555, () => {
      console.log("Server is running in the port 5555");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!!");
  });
