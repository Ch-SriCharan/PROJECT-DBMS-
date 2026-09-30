import Notification from '../models/Notification.js';
import { NOTIFICATION_STATUS } from '../config/constants.js';

export const sendNotification = async ({
  userId,
  appointmentId = null,
  message,
  type,
  scheduledAt = new Date(),
}) => {
  try {
    const notification = await Notification.create({
      userId,
      appointmentId,
      message,
      type,
      status: NOTIFICATION_STATUS.UNREAD,
      scheduledAt,
      sentAt: new Date(),
    });

    console.log(`[Notification Dispatched] To: ${userId} | Type: ${type} | Msg: ${message}`);
    return notification;
  } catch (error) {
    console.error(`Failed to send notification: ${error.message}`);
    return null;
  }
};
