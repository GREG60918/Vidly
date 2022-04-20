const { Genre, validate } = require('../models/genre.js');
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin.js');
const asyncMiddleware = require('../middleware/async.js');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validate');
const router = express.Router();

router.get('/', asyncMiddleware(async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
}));

router.post('/', [auth, validateRequest(validate)], asyncMiddleware(async (req, res) => {
  const genre = new Genre({ name: req.body.name });
  await genre.save();

  res.send(genre);
}));

router.put('/:id', [auth, validateObjectId, validateRequest(validate)], asyncMiddleware(async (req, res) => {
  const genre = await Genre.findByIdAndUpdate( req.params.id, { name: req.body.name }, { new: true });
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(genre);
}));

router.delete('/:id', [auth, admin, validateObjectId], asyncMiddleware(async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
}));

router.get('/:id', validateObjectId, asyncMiddleware(async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) 
    return res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
}));

module.exports = router;