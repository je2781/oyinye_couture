

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    colors: [
        {
            type: {
                type: String,
                required: true
            },
            isAvailable: {
                type: Boolean,
                required: true
            },
            sizes: [
                {
                    number: {
                        type: Number,
                        required: true
                    },
                    price: {
                        type: Number,
                        required: true
                    },
                    variantId: {
                        type: String,
                        required: true
                    },
                    stock: {
                        type: Number,
                        required: true
                    }
                }
            ],
            imageFrontBase64: [
                {
                    type: String,
                    required: true
                }
            ],
            imageBackBase64:  {
                type: String,
                required: true
            }
        }
    ],
    description: {
        type: String,
        required: true
    },
    noOfOrders: {
        type: Number
    },
    type: {
        type: String,
        required: true
    },
    reviews: [
        {
            reviewId: {
                ref: 'reviews',
                type: Schema.Types.ObjectId,
                required: true
            }
        }
    ],
    
    

});

const Product = mongoose.models.products ?? mongoose.model('products', ProductSchema);

export default Product;
  