const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

let Floor = new Schema({
    name: String,
    rooms: [{
        name: String
    }]
});

Floor.statics.getForBuilding = function getForBuilding(building){
    return this.model(`Floor`)
    .find({building})
    .exec();
}

module.exports = mongoose.model('Floor', Floor);