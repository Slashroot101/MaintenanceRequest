const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

let Campus = new Schema({
    name: String,
    buildings: [{
        name: String,
        floors: [{
            name: String,
            rooms: [{
                name: String
            }]
        }]
    }],
});

Campus.statics.getAll = function getAll(){
    return this.model(`Campus`)
    .find()
    .exec();
}

module.exports = mongoose.model('Campus', Campus);