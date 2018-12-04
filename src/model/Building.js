const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

let Building = new Schema({
    name: String,
    floors: [{
        name: String,
        rooms: [{
            name: String
        }]
    }]
});

Building.statics.getForCampus = function getForCampus(campus){
    return this.model(`Building`)
    .find({campus})
    .exec();
}

module.exports = mongoose.model('Building', Building);