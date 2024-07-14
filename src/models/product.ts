

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
                    id: {
                        type: Schema.Types.ObjectId,
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
    totalSizes: [
        {
            type: Number,
            required: true
        }
    ],
    description: {
        type: String,
        required: true
    }
    
    

});

const Product = mongoose.model('products', ProductSchema);

export default Product;
  