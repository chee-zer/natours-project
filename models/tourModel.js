const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A group  must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A group must have a difficulty'],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover page'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

TourSchema.virtual('durationWeeks').get(function () {
  const weeks = Math.floor(this.duration / 7);
  const days = this.duration - weeks * 7;
  if (weeks === 0) {
    return `${this.duration} days`;
  } else {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}${days === 0 ? '' : `, ${days} days`}`;
  }
});

const Tour = new mongoose.model('Tour', TourSchema);

module.exports = Tour;
