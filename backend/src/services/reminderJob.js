import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { APPOINTMENT_STATUS, NOTIFICATION_TYPE } from '../config/constants.js';
import { sendNotification } from './notificationService.js';

let reminderTask = null;

export const checkAndSendReminders = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Find active appointments for today and future dates that haven't received a reminder
    const upcomingAppointments = await Appointment.find({
      date: { $gte: todayStr },
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
      reminderSent: { $ne: true },
    }).populate('doctorId', 'name specialty').populate('clinicId', 'name location');

    for (const appt of upcomingAppointments) {
      const doctorName = appt.doctorId?.name || 'your doctor';
      const clinicName = appt.clinicId?.name || 'the clinic';
      const message = `Reminder: You have an upcoming appointment with Dr. ${doctorName} on ${appt.date} at ${appt.startTime} at ${clinicName}.`;

      await sendNotification({
        userId: appt.patientId,
        appointmentId: appt._id,
        message,
        type: NOTIFICATION_TYPE.REMINDER,
      });

      appt.reminderSent = true;
      await appt.save();
      console.log(`[Reminder Job] Sent reminder for appointment ${appt._id} to patient ${appt.patientId}`);
    }
  } catch (error) {
    console.error(`[Reminder Job Error]: ${error.message}`);
  }
};

export const startReminderJob = () => {
  if (reminderTask) return;

  // Run every 5 minutes
  reminderTask = cron.schedule('*/5 * * * *', async () => {
    console.log('[Reminder Job] Checking for pending appointment reminders...');
    await checkAndSendReminders();
  });

  console.log('Automated Appointment Reminder Cron Job initialized.');
};

export const stopReminderJob = () => {
  if (reminderTask) {
    reminderTask.stop();
    reminderTask = null;
    console.log('Automated Reminder Cron Job stopped.');
  }
};
