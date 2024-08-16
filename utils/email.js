const nodemailer = require('nodemailer');

const sendEMail = async (options) => {
  //first the transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //mail config
  const mailOptions = {
    from: 'cheezer <cheezer.dev@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEMail;
