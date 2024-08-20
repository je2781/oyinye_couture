import mongoose from "mongoose";
import Product from "./product";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  isAdmin: {
    type: Boolean,
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
  enableEmailMarketing: {
    type: Boolean,
    default: false
  }


});






const User = mongoose.models.users ?? mongoose.model("users", UserSchema);

export default User;
