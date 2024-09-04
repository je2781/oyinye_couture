import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const VisitorSchema = new Schema({
    ip: {
        type: String,
    },
    browser: {
        type: String,
    },
    device: {
        type: String,
    }
});

const Visitor = mongoose.models.visitors ?? mongoose.model('visitors', VisitorSchema);

export default Visitor;

