const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE;
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log(`DB connections successful!!`);
});

// console.log(process.env);

app.listen(port, () => {
  console.log(`SERVER RUNNING ON DA ${port} ayayaya`);
});
