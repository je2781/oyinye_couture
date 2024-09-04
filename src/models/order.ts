import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  _id: String,
  items: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      variantId: {
        type: String,
      },
    },
  ],
  sales: {
    type: Number
  },
  status: {
    type: String,
    required: true,
  },
  paymentInfo: {
    type: Object,
  },
  shippingMethod: String,
  paymentType: String,
  paymentStatus: String,
  user: {
    email: {
      type: String,
    },
    userId: {
      ref: "users",
      type: Schema.Types.ObjectId,
    },
  },
},{
    timestamps: true
});

const Order = mongoose.models.orders ?? mongoose.model("orders", OrderSchema);

export default Order;
