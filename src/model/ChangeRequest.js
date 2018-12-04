const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;
let moment = require(`moment`);

let ChangeRequest = new Schema({
    notes: String,
    markups: String,
    createdBy: String,
    createdOn: {
        type: Date
    },
    emergency: {
        type: Boolean
    },
    completedOn: {
        type: Date,
        default: null
    },
    urn: String,
    floor: String
});

ChangeRequest.statics.setComplete = function setComplete(id){
    return this.model(`ChangeRequest`)
    .findOneAndUpdate(
        {_id : id},
        {completedOn: new Date()},
        {new: true}
        ).exec();
}

ChangeRequest.statics.getAllByFloor = function getAll(floor){
    return this.model(`ChangeRequest`)
    .find({ floor, completedOn: null })
    .exec();
};

ChangeRequest.statics.getAll = function getAll(floor){
    return this.model(`ChangeRequest`)
    .find({ completedOn: null })
    .exec();
};

ChangeRequest.statics.pushMarkups = function pushMarkups(id, markups){
    return this.model(`ChangeRequest`)
    .findOneAndUpdate(
        {_id : id},
        { $push: { "markups" : markups } },
        { upsert: false, new: true }
        )
    .exec();
};

ChangeRequest.statics.getCompletedForDay = function getCompletedForDay(floor){
    return this.model(`ChangeRequest`)
    .find({ createdOn: {
            $gte : new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000))),
        },
        floor: floor,
        completedOn: {$ne: null}
    }).count().exec();
};

ChangeRequest.statics.averageTimeToComplete = function averageTimeToComplete(floor){
    return this.model(`ChangeRequest`)
    .aggregate([
        {
            $match: {
                floor: floor,
                completedOn: {$ne: null},
                createdOn: {
                    $gte : new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000))),
                }
            },
        },
        {
            $project: {
                amountOfTime:
                    { $subtract: [

			
                        "$completedOn",
		 	"$createdOn"                    
]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgTime: {$avg : "$amountOfTime"}
            }
        }
    ]).exec();
};

ChangeRequest.statics.getAverageCreatedForLastWeek = function getAverageCreatedForLastWeek(floor){
    return this.model(`ChangeRequest`)
    .aggregate([
        {
            $match: {
                floor: floor,
                createdOn: {
                    $gt : new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000))),
                }
            }
        },
        {
            $group: {
                _id: "$floor",
                count: { $sum : 1 }
            }
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$count"}
            }
        }   
    ]).exec();
}

ChangeRequest.statics.getPerDayForLastWeek = function getPerDayForWeek(floor){
    return this.model(`ChangeRequest`)
    .aggregate(
        [
        {
            $match : { 
                    createdOn: {
                                $gte : new Date(Date.now() / 1000 - 24 * 60 * 60),
                                $lte: new Date()
                            },
floor: floor
                        },
        },
        {
            $project: {
                year: {
                    $year: "$createdOn"
                },
                month: {
                    $month: "$createdOn"
                },
                date: {
                    $dayOfMonth: "$createdOn"
                }
            }
        },
        {
            $sort: {
                date: -1
            }
        },
        {
            $group: {
                '_id' : {
                     year : '$year',
                     month: '$month',
                     day: '$date'
                },
                'count' :{'$sum': 1}
            }
        }]
    ).exec();
};



ChangeRequest.statics.getForFloor = function getForFloor(floor){
    return this.model(`ChangeRequest`)
    .find({floor})
    .exec();
};

module.exports = mongoose.model('ChangeRequest', ChangeRequest);
