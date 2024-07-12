const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    /*
    - query object we need for mongoose: {difficulty: 'easy', duration: {$gte: 5}}

    - the get request looks like: ?difficulty=easy&duration[gte]=5

    - the query object returned by express: {difficulty: 'easy', duration: {gte: 5}}
    so just remove the $
    */

    //here we build the query(no awaiting for the result, since that executes it)

    //1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //2) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const query = Tour.find(JSON.parse(queryStr));

    //3) Sorting
    let sortFields = req.query.sort;
    if (sortFields) {
      sortFields = sortFields.split(',').join(' ');
      query.sort(sortFields);
    } else {
      query.sort('duration');
    }
    //here we execute the query
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    console.log(`here`);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        updatedTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message,
    });
  }
  aww;
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      deleted: deletedTour,
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message,
    });
  }
};

exports.deleteAllTours = async (req, res) => {
  try {
    const deletedTour = await Tour.deleteMany();
    res.status(200).json({
      status: 'success',
      deleted: deletedTour,
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error.message,
    });
  }
};
