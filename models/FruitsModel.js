const mongoose = require('mongoose');

// Define a schema for your fruits collection
const fruitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['citrus', 'Indigenous and Wild', 'tropical', 'others'],
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    origin: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    image: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /\.(jpg|jpeg|png|gif)$/i.test(v);
            },
            message: 'Invalid image format',
        },
    },
    weight: {
        type: Number,
        min: 0,
    },
    unitType: {
        type: String,
        enum: ['kilogram', 'piece', 'bundle'],
    },
    nutritionalInformation: {
        calories: {
            type: Number,
            min: 0,
        },
        vitamins: {
            type: [String],
            validate: {
                validator: function(arr) {
                    return arr.length <= 10;
                },
                message: 'Exceeds the limit of 10 vitamins',
            },
        },
    },
    supplier: {
        name: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        contact: {
            type: String,
            trim: true,
            maxlength: 100,
        },
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    reviews: [
        {
            user: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100,
            },
            comment: {
                type: String,
                trim: true,
                maxlength: 500,
            },
            rating: {
                type: Number,
                min: 0,
                max: 5,
            },
        },
    ],
});

// Create indexes for better query performance
fruitSchema.index({ name: 1 });
fruitSchema.index({ category: 1 });

// Create a model for your fruits collection
const Fruit = mongoose.model('Fruit', fruitSchema);

module.exports = Fruit;
