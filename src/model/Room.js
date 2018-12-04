const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

let Room = new Schema({
    number: Number,
});

Room.statics.getForFloor = function getForFloor(floor){
    return this.model(`Floor`)
    .find({floor})
    .exec();
}

module.exports = mongoose.model('Room', Room);