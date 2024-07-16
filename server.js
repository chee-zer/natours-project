const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHT EXCEPTION`);
  console.log(err.name, ' : ', err.message);
  process.exit(1);
});

const DB = process.env.DATABASE;
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log(`DB connections successful!!`);
});

// console.log(process.env);

const server = app.listen(port, () => {
  console.log(`SERVER RUNNING ON DA ${port} ayayaya`);
});

process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTION`);
  console.log(err.name, ' : ', err.message);
  server.close(() => {
    process.exit(1);
  });
});
