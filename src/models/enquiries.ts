import { timeStamp } from 'console';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EnquiriesSchema = new Schema({
    author: {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        order: {
            phoneNo: String,
            residence: String,
            size: Number,
            styles: [
                {
                    data: Object
                }
            ],
        }
    },
    order: {
        content: String,
        eventDate: Date,
        read: {
            type: Boolean,
            default: false
        },
        unRead: {
            type: Boolean,
            default: true
        },
        saved: {
            type: Boolean,
            default: false
        }
    },
    contact: {
        subject: String,
        message: String,
        read: {
            type: Boolean,
            default: false
        },
        unRead: {
            type: Boolean,
            default: true
        },
        saved: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
}
);

const Enquiries = mongoose.models.enquiries ?? mongoose.model('enquiries', EnquiriesSchema);

export default Enquiries;

