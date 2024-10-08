import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FilterSchema = new Schema({
        search: {
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
            }
        },
        collections: {
            noOfFilters: {
                type: Number,
            },
            isVisible: {
                type: Boolean,
            },
            color: String,
            customProperty: {
                type: String,
                name: String
            }
        }
  
});

const Filter = mongoose.models.filters ?? mongoose.model('filters', FilterSchema);

export default Filter;

