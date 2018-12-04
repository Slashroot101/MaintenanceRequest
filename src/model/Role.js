const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;
const DEFAULT_ROLE_NAME = `BaseUser`;

let Role = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: {
                unique: true
            }
        }
    }
);


module.exports = mongoose.model('Role', Role);