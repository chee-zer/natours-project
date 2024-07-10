const mongoose = require('mongoose');
const fs = require('fs');
const Tours = require('../../models/tourModel');
const Tour = require('../../models/tourModel');
const tours = JSON.parse(
  fs
    .readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
    .then(() => console.log(`file read!`)),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log(`Data loaded into database`);
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(`Data deleted successfully`);
  } catch (error) {
    console.log(error);
  }
};
