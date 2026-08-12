'use strict';

/**
 * Reminder Job
 * Scheduled job to send subscription expiry reminders.
 * Runs daily at 8:00 AM.
 */

const { getSupabaseAdmin } = require('../database/supabase');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const REMINDER_DAYS = [7, 3, 1]; // Send reminders 7, 3, and 1 days before expiry

async function sendExpiryReminders() {
  logger.info('Starting subscription expiry reminder job');

  try {
    const now = new Date();

    for (const days of REMINDER_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

      const { data: subscriptions, error } = await getSupabaseAdmin()
        .from('subscriptions')
        .select('*, users!inner(phone, full_name)')
        .eq('status', 'active')
        .gte('expires_at', startOfDay)
        .lte('expires_at', endOfDay);

      if (error) {
        logger.error('Reminder job: Failed to fetch subscriptions', { error: error.message, days });
        continue;
      }

      if (!subscriptions || subscriptions.length === 0) {
        logger.info('Reminder job: No subscriptions expiring', { days });
        continue;
      }

      logger.info('Reminder job: Sending reminders', { count: subscriptions.length, days });

      for (const sub of subscriptions) {
        const phone = sub.users?.phone;
        const fullName = sub.users?.full_name;
        const packageName = sub.package_key;

        if (!phone) continue;

        try {
          await notificationService.notifySubscriptionReminder(phone, {
            packageName,
            expiresAt: sub.expires_at,
            days,
          });

          logger.info('Reminder sent', { phone, packageName, days, subscriptionId: sub.id });
        } catch (err) {
          logger.error('Reminder send failed', { phone, subscriptionId: sub.id, error: err.message });
        }
      }
    }

    logger.info('Subscription expiry reminder job completed');
  } catch (err) {
    logger.error('Reminder job failed', { error: err.message, stack: err.stack });
  }
}

// Schedule: run daily at 8:00 AM
function startReminderJob() {
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(8, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const msUntilRun = nextRun.getTime() - now.getTime();

  logger.info('Reminder job scheduled', { nextRun: nextRun.toISOString(), msUntilRun });

  setTimeout(() => {
    sendExpiryReminders();

    // Then run every 24 hours
    setInterval(sendExpiryReminders, 24 * 60 * 60 * 1000);
  }, msUntilRun);
}

// Allow manual trigger for testing
module.exports = { sendExpiryReminders, startReminderJob };