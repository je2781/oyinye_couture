import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FilterSchema = new Schema({
    noOfFilters: {
        type: Number,
    },
    isVisible: {
        type: Boolean,
    },
    showOutOfStock: {
        type: Boolean,
    },
    productType: {
        type: String,
    },
    priceRange: {
        type: String,
    },
    currentPriceBoundary: {
        type: Number,
    },
});

const Filter = mongoose.models.filters ?? mongoose.model('filters', FilterSchema);

export default Filter;

