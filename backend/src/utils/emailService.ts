const nodemailer = require("nodemailer");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (subscription: any) => {
  // Fetch user email
  const user = await User.findById(subscription.user);
  if (!user || !user.email) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Subscription Reminder: ${subscription.name}`,
    text: `
Hi ${user.name || ""},

Your subscription "${
      subscription.name
    }" is due on ${subscription.nextBillingDate.toDateString()}.

Cost: ${subscription.cost} ${subscription.currency}
Billing Cycle: ${subscription.billingCycle}

You may want to review or cancel it if not needed.

– Subscription Tracker
    `,
  };

  await transporter.sendMail(mailOptions);
};
