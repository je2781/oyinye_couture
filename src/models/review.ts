import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    headline: {
        type: String,
    },
    rating: Number,
    content: {
        type: String,
    },
    isMedia: {
        type: Boolean,
        default: false,
    },
    author: {
        id: {
            ref: 'users',
            type: Schema.Types.ObjectId
        }
    }
},{
    timestamps: true
}
);

const Review = mongoose.models.reviews ?? mongoose.model('reviews', ReviewSchema);

export default Review;

