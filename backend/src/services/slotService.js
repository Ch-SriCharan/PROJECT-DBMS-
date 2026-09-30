/**
 * Converts a time string "HH:MM" to total minutes from 00:00
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts total minutes from 00:00 to "HH:MM"
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Generates array of slot objects [{ startTime, endTime, isAvailable }]
 * based on working hours and duration in minutes
 */
export const generateSlots = (startTime, endTime, slotDuration = 30) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = Number(slotDuration);

  const slots = [];
  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + duration);

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: true,
    });

    currentMinutes += duration;
  }

  return slots;
};
