const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.js');
const validateRequest = require('../middleware/validate.js');
const { Rental } = require('../models/rental.js');
const { Movie } = require('../models/movie.js');

router.post('/', [auth, validateRequest(validateReturn)], asyncMiddleware(async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) return res.status(404).send('Rental not found');

    if(rental.dateReturned) return res.status(400).send('Return already processed');

    rental.return();
    await rental.save();

    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    // 200 gets set by default, no .status needed
    res.send(rental);
}));

function validateReturn(req) {
    const schema = {
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
    };
  
    return Joi.validate(req, schema);
}

module.exports = router;