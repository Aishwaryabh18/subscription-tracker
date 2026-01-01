const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const { sendReminderEmail } = require("./emailService");

const startReminderCron = () => {
  // Run every day at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] Running subscription reminder job");

    try {
      const subscriptions = await Subscription.find({
        status: "active",
        reminderEnabled: true,
      });

      for (const sub of subscriptions) {
        if (sub.shouldSendReminder()) {
          await sendReminderEmail(sub);

          // IMPORTANT: mark reminder as sent
          sub.lastReminderSent = new Date();
          await sub.save();
        }
      }
    } catch (err) {
      console.error("[CRON ERROR]", err);
    }
  });
};

module.exports = { startReminderCron };
