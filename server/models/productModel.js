const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        images: [String],
        category: {
            type: String,
            required: true,
        },
        type: {
            type: String,
        },
        notes: [{
            type: String,
        }],
        sizes: [{
            size: String,
            price: Number,
        }],
        stock: {
            type: Number,
            default: 0,
        },

        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", ProductSchema);
