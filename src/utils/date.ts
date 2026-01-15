export const getIsoWeek = (date: Date) => {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: temp.getUTCFullYear() };
};

export const getNextSaturdayLabel = (date: Date) => {
  const nextSaturday = new Date(date);
  const day = nextSaturday.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  nextSaturday.setDate(nextSaturday.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
  nextSaturday.setHours(23, 59, 59, 999);

  const diffMs = nextSaturday.getTime() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  const diffDays = Math.floor(diffHours / 24);
  const hoursRemainder = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays}d ${hoursRemainder}h`;
  }
  return `${hoursRemainder}h`;
};
