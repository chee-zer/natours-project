const tourController = require('./../controllers/tourController');
const express = require('express');

const tourRouter = express.Router();

tourRouter
  .route('/')
  .post(tourController.createTour)
  .get(tourController.getAllTours)
  .delete(tourController.deleteAllTours);

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
