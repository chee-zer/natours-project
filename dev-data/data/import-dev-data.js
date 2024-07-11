const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv').config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

mongoose.connect(process.env.DATABASE).catch((err) => console.log(err.message));

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

const args = process.argv.toString();

if (args.includes('--import') && args.includes('--delete')) {
  console.error('\x1b[31m%s\x1b[0m', `INVALID COMMAND`);
  process.exit(1);
} else if (args.includes('--import')) {
  importData();
} else if (args.includes('--delete')) {
  deleteData();
}
