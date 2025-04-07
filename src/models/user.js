const mongoose = require("mongoose");
const validator = require("validator")

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required:true,
    minlength:4,
    maxlength:50,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    lowercase:true,
    required:true,
    unique:true,
    trim:true,
    validate(value)
    {
       if(!validator.isEmail(value))
       {
        throw new Error("Invalid email address "+ value);
       }
    }
  },
  password: {
    type: String,
    required:true,
    validate(value)
    {
       if(!validator.isStrongPassword(value))
       {
        throw new Error("Enter a Strong Password "+ value);
       }
    }
  },
  age: {
    type: Number,
    min:18
  },
  gender: {
    type: String,
    validate(value){
      if(!["male","female","others"].includes(value))
      {
        throw new Error("Gender data is not Valid")
      }
    }
  },
  photoUrl : {
    type:String,
    default:"https://www.cgg.gov.in/wp-content/uploads/2017/10/dummy-profile-pic-male1.jpg",
    validate(value)
    {
       if(!validator.isURL(value))
       {
        throw new Error("Invalid image urlA address "+ value);
       }
    }
  },
  about:{
    type:String,
    default:"This is the default value of the user"
  },
  skills:{
    type:[String],
  }
},{
  timestamps:true,
});

module.exports = mongoose.model("User", userSchema);
