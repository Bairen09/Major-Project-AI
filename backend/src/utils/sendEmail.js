const nodemailer = require('nodemailer');
const AppError = require('../errors/AppError');

/**
 * Sends an email or logs it to the console in development mode.
 *
 * Behavior:
 *   - SMTP credentials present → sends real email
 *   - NODE_ENV === 'development' and no SMTP → logs to console
 *   - Production with no SMTP → throws AppError
 *
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.text
 */
const sendEmail = async ({ to, subject, text }) => {
  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtp) {
    const port = Number(process.env.SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@localboost.ai',
      to,
      subject,
      text,
    });

    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('----------- DEV EMAIL -----------');
    console.log(`To      : ${to}`);
    console.log(`Subject : ${subject}`);
    console.log(`Body    :\n${text}`);
    console.log('---------------------------------');
    return;
  }

  throw new AppError(
    'Email configuration error: SMTP credentials are not set in production.',
    500
  );
};

module.exports = sendEmail;
