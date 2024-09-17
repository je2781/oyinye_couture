import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    author: {
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    content: String,
    phoneNo: String,
    styles: [
        {
            image: String
        }
    ],
    eventDate: Date,
    residence: String,
    size: Number
});

const Appointments = mongoose.models.appointments ?? mongoose.model('appointments', AppointmentSchema);

export default Appointments;

