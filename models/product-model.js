const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    image: Buffer,
    name: String,
    price: Number,
    popularity: { type: Number, default: 0 },
    discount: {
        type: Number,
        default: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    availability: {
        type: String,
        enum: ['In Stock', 'Few Left', 'Out of Stock'],
        default: 'In Stock'
    },
    newest: {
        type: String,
        enum: ['New Release', 'Fresh', 'Old'],
        default: 'Fresh'
    },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model("product", productSchema)