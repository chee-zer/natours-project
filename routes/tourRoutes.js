const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const tourRouter = express.Router();

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plans/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .post(tourController.createTour)
  .get(authController.protect, tourController.getAllTours)

  .delete(tourController.deleteAllTours);

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
