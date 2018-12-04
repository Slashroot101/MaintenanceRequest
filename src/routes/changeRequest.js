const express = require('express');
const router = express.Router();
const ChangeRequest = require(`../model/ChangeRequest`);

router.post('/', async function (req, res, next) {
    try {
        console.log(req.body);
        let changeRequest = new ChangeRequest({
            campus: req.body.campus,
            building: req.body.building,
            floor: req.body.floor,
            urn: req.body.urn,
            room: req.body.room,
            emergency: req.body.emergency,
            notes: req.body.description,
            createdOn: Date.now(),
            createdBy: `UC`
        });

        let savedChange = await changeRequest.save();

        res.json(savedChange._id);
    } catch (err) {
        console.log(err);
    }
});

router.put('/:id/complete', async function(req, res, next){
    try {
        let changeReq = await ChangeRequest.setComplete(req.params.id);
        req.app.io.emit('completedChangeRequest', {id: req.params.id, floor: changeReq.floor});
        res.json(changeReq);
    } catch (err){
        res.status(500).json(err);
    }
}); 

router.put('/:id/markups', async function(req, res, next){
    try {
        let updatedChangeRequest = await ChangeRequest.pushMarkups(req.params.id, req.body.markups);
        req.app.io.emit('newChangeRequest', updatedChangeRequest);
        res.json({}).end();
    } catch (err){
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/markups/floor/:floor/all', async function(req, res, next){
    try {
        console.log(req.params.floor)
        let markups = await ChangeRequest.getAllByFloor(req.params.floor);
        console.log(markups)
        res.status(200).json({ markups });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/floor/:floor/completed', async function(req, res, next){
    try {
        let numMarkups = await ChangeRequest.getCompletedForDay(req.params.floor);
        res.status(200).json({ completed: numMarkups });
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/floor/:floor/day', async function(req, res, next){
    try {
        let numMarkups = await ChangeRequest.getPerDayForLastWeek(req.params.floor);
        res.status(200).json({ count: numMarkups });
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/floor/:floor/average/day', async function(req, res, next){
    try {
        let avgMarkups = await ChangeRequest.getAverageCreatedForLastWeek(req.params.floor);
        res.status(200).json({ average: avgMarkups });
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get('/floor/:floor/completed/avg', async function(req, res, next){
    try {
        let avg = await ChangeRequest.averageTimeToComplete(req.params.floor);
        res.status(200).json({ average: avg });
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.get(`/all`, async function(req, res, next){
    try {
        let changeRequests = await ChangeRequest.getAll();
        res.json(changeRequests);
    } catch (err){
        res.status(500).json(err);
    }
});



module.exports = router;
