import mongoose from "mongoose";
import Product from "./product";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a firstname"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a lastname"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  resetTokenExpirationDate: Date,
  verifyToken: String,
  verifyTokenExpirationDate: Date,

});



const User = mongoose.model("users", UserSchema);

export default User;
