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
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  resetToken: String,
  resetTokenExpirationDate: Date,
  verifyToken: String,
  verifyTokenExpirationDate: Date,
  reviews: [
    {
        content: {
            type: String,
        },
        productId: {
            ref: 'products',
            type: Schema.Types.ObjectId
        }
    }
  ],


});






const User = mongoose.models.users ?? mongoose.model("users", UserSchema);

export default User;
