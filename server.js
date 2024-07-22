const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');

dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHT EXCEPTION`);
  console.log(err.name, ' : ', err.message);
  server.close(() => {
    process.exit(1);
  });
});

const DB = process.env.DATABASE;
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log(`DB connections successful!!`);
});

// console.log(process.env);

server.listen(port, () => {
  console.log(`SERVER RUNNING ON DA ${port} ayayaya`);
});

process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTION`);
  console.log(err.name, ' : ', err.message);
  server.close(() => {
    process.exit(1);
  });
});
