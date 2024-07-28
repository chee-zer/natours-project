const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllTours = catchAsync(async (req, res) => {
  /*
    - query object we need for mongoose: {difficulty: 'easy', duration: {$gte: 5}}

    - the get request looks like: ?difficulty=easy&duration[gte]=5

    - the query object returned by express: {difficulty: 'easy', duration: {gte: 5}}
    so just remove the $
    */

  //here we build the query(no awaiting for the result, since that executes it)

  // //1) Filtering
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // //2) Advanced Filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // const query = Tour.find(JSON.parse(queryStr));

  // //3) Sorting
  // let sortFields = req.query.sort;
  // if (sortFields) {
  //   sortFields = sortFields.split(',').join(' ');
  //   query.sort(sortFields);
  // } else {
  //   query.sort('duration');
  // }

  // //4) Field limiting
  // if (req.query.fields) {
  //   let fields = req.query.fields.split(',').join(' ');
  //   query.select(fields);
  // } else {
  //   query.select('-__v');
  // }

  // // 5) Pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 8;
  // //1 1, 2 6, 3 11
  // const skip = (page - 1) * limit;
  // query.skip(skip).limit(limit);

  //NOTE: i have not done any aliasing im bored check if you want
  //here we execute the query
  // const tours = await query;
  const features = new APIFeatures(Tour.find(), req.query);
  features.filter().sort().limitFields().paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('Couldnt find a tour with that ID', 404));
  }

  console.log(tour);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  console.log(`here`);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError('Couldnt find a tour with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError('Couldnt find a tour with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    deleted: deletedTour,
  });
});

exports.deleteAllTours = catchAsync(async (req, res) => {
  const deletedTour = await Tour.deleteMany();
  res.status(200).json({
    status: 'success',
    deleted: deletedTour,
  });
});

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'easy' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
