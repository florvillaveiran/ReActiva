export type ReminderWindowInput = {
  unlockTime: string;
  currentTime: string;
  unlockLeadMinutes: number;
  reminderBeforeUnlockMinutes: number;
  recoveryWindowMinutes: number;
};

export const normalizeTime = (time: string) => time.slice(0, 5);

export const minutesFromTime = (time: string) => {
  const [hours = '0', minutes = '0'] = normalizeTime(time).split(':');
  return Number(hours) * 60 + Number(minutes);
};

export const getReminderWindowStatus = ({
  unlockTime,
  currentTime,
  unlockLeadMinutes,
  reminderBeforeUnlockMinutes,
  recoveryWindowMinutes,
}: ReminderWindowInput) => {
  const targetTime = normalizeTime(unlockTime);
  const currentMinutes = minutesFromTime(currentTime);
  const targetMinutes = minutesFromTime(targetTime);
  const reminderMinute = targetMinutes - unlockLeadMinutes - reminderBeforeUnlockMinutes;
  const elapsedMinutes = currentMinutes - reminderMinute;
  const minutesUntilUnlock = targetMinutes - unlockLeadMinutes - currentMinutes;
  const due = elapsedMinutes >= 0
    && elapsedMinutes <= recoveryWindowMinutes
    && minutesUntilUnlock >= 0;

  return { targetTime, elapsedMinutes, minutesUntilUnlock, due };
};

export type MissedReminderWindowInput = {
  unlockTime: string;
  currentTime: string;
  unlockLeadMinutes: number;
  delayMinutes: number;
  recoveryWindowMinutes: number;
};

export const getMissedReminderWindowStatus = ({
  unlockTime,
  currentTime,
  unlockLeadMinutes,
  delayMinutes,
  recoveryWindowMinutes,
}: MissedReminderWindowInput) => {
  const targetTime = normalizeTime(unlockTime);
  const currentMinutes = minutesFromTime(currentTime);
  const unlockMinutes = minutesFromTime(targetTime) - unlockLeadMinutes;
  const reminderMinute = unlockMinutes + delayMinutes;
  const elapsedMinutes = currentMinutes - reminderMinute;
  const due = elapsedMinutes >= 0 && elapsedMinutes <= recoveryWindowMinutes;

  return { targetTime, elapsedMinutes, due };
};
