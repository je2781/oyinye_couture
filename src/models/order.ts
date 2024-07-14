import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    items: [
        {
            product: {
                type: Object,
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

const Order = mongoose.model('orders', OrderSchema);

export default Order;

