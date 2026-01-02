const nodemailer = require("nodemailer");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendReminderEmail = async (subscription) => {
  // Fetch user email
  const user = await User.findById(subscription.user);
  if (!user || !user.email) {
    console.log("[EMAIL] User email not found");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Subscription Reminder: ${subscription.name}`,
    text: `Your subscription "${
      subscription.name
    }" is due on ${subscription.nextBillingDate.toDateString()}`,
  });

  console.log(`[EMAIL] Reminder sent to ${user.email}`);
};

module.exports = { sendReminderEmail };
