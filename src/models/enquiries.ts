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
        appointment: {
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
    appointment: {
        content: String,
        eventDate: Date,
        read: Boolean,
        unRead: Boolean,
        saved: Boolean
    },
    contact: {
        subject: String,
        message: String,
        read: Boolean,
        unRead: Boolean,
        saved: Boolean
    }
}, {
    timestamps: true
}
);

const Enquiries = mongoose.models.enquiries ?? mongoose.model('enquiries', EnquiriesSchema);

export default Enquiries;

