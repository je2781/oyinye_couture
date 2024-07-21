import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    items: [
        {
            productId: {
                // type: Object,
                ref: 'products',
                type: Schema.Types.ObjectId,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
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

const Order = mongoose.models.orders || mongoose.model('orders', OrderSchema);

export default Order;

