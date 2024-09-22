import { timeStamp } from 'console';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    author: {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        phoneNo: String,
        residence: String,
        size: Number,
        styles: [
            {
                data: Object
            }
        ],
    },
    content: String,
    eventDate: Date,
    read: Boolean,
    unRead: Boolean,
    saved: Boolean
}, {
    timestamps: true
}
);

const Appointments = mongoose.models.appointments ?? mongoose.model('appointments', AppointmentSchema);

export default Appointments;

