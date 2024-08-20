import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    _id: String,
    items: [
        {
            product: {
                type: Object,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            variantId: {
              type: String,

            }
        }
    ],
    shippingInfo: {
        type: Object
    },
    billingInfo: {
        type: Object
    },
    paymentInfo: {
        type: Object
    },
    status: {
        type: String,
        required: true
    },
    paymentType: String,
    paymentStatus: String,
    saveShippingInfo: Boolean,
    saveBillingInfo: Boolean,
    user: {
        email: {
            type: String,
        },
        userId: {
            ref: 'users',
            type: Schema.Types.ObjectId
        }
    }
});

const Order = mongoose.models.orders ?? mongoose.model('orders', OrderSchema);

export default Order;

