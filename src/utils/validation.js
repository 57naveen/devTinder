const validator = require("validator"); // this is the external libirary for validation

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};

const validataEditProfileData = (req) => {
  //Allow only this field should be edit by user
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  //This for checking the req.body have allowed field are not
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  // retuen the boolean
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validataEditProfileData,
};
