const mongoose = require('mongoose');



const userSchema = mongoose.Schema({
    fullname: String,
    contact : Number,
    email : String,
    password : String,
    cart : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        quantity: { type: Number }
    },
],
    orders : [],
    picture : String,
    address: String,
});

module.exports = mongoose.model("user", userSchema);

