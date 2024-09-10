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
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  shippingInfo: {
    type: Object,
  },
  billingInfo: {
    type: Object,
  },
  saveShippingInfo: {
    type: Boolean,
    default: false
  },
  saveBillingInfo: {
    type: Boolean,
    default: false
  },
  resetToken: String,
  resetTokenExpirationDate: Date,
  verifyToken: String,
  verifyTokenExpirationDate: Date,
  enableEmailMarketing: {
    type: Boolean,
    default: false
  },
  visitor: {
    visitId: {
      ref: "visitors",
      type: Schema.Types.ObjectId,
    },
  }


});


const User = mongoose.models.users ?? mongoose.model("users", UserSchema);

export default User;
