const { Mongoose } = require("mongoose");

let mongoose = new Mongoose();
let UserRupesSchema = new mongoose.Schema({
    userid: String,
    rupes: Number,
    xp: Number,
    lv: Number,
    guilds: Array,
    box: Array,
    daily: Number
});

let UserRupes = mongoose.model("UserRupes", UserRupesSchema);

module.exports = {
    UserRupes, mongoose
};