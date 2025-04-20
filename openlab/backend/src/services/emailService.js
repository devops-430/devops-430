const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendApiKey = async (email, apiKey) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your OpenLab API Key',
    html: `
      <h1>Welcome to OpenLab!</h1>
      <p>Your API key is: <strong>${apiKey}</strong></p>
      <p>Please keep this key secure and never share it with anyone.</p>
      <p>You can use this key to authenticate your requests to the OpenLab API.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendApiKey,
}; 