const { Rental, validate } = require('../models/rental.js');
const { Movie } = require('../models/movie.js');
const { Customer } = require('../models/customer.js');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  if(movie.numberInStock === 0) return res.status(400).send('The movie is out of stock.');

  let rental = new Rental({ 
    customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
    },
    movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  try {
    new Fawn.Task()
        .save('rentals', rental)
        .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
        })
        .run();

        res.send(rental);
    }
    catch(ex) {
        res.status(500).send('Something failed. (500 is internal server error)');
    }
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

module.exports = router;