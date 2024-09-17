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
        authorId: {
            ref: 'users',
            type: Schema.Types.ObjectId
        }
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
}
);

const Review = mongoose.models.reviews ?? mongoose.model('reviews', ReviewSchema);

export default Review;

