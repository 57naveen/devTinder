const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //get the token from the cookies
    const { token } = req.cookies;
    if (!token) {
     return res.status(401).send("Please Login!")
    }

    //verfiy the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET_CODE);

    //extract the id from the decodedObj
    const { _id } = decodedObj;

    //find the user from the db using that ID
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not Found");
    }
    
    //set the user in the request 
    req.user = user
    
    next();
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
};

module.exports = {
  userAuth
}