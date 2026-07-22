export type DashboardPeriod = 'semanal' | 'mensual';

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDashboardPeriodRanges = (period: DashboardPeriod, now = new Date()) => {
  if (period === 'mensual') {
    const currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousTo = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      current: { from: dateKey(currentFrom), to: dateKey(currentTo) },
      previous: { from: dateKey(previousFrom), to: dateKey(previousTo) },
      label: 'este mes',
    };
  }

  const currentFrom = new Date(now);
  const weekday = currentFrom.getDay();
  currentFrom.setDate(currentFrom.getDate() - (weekday === 0 ? 6 : weekday - 1));
  const currentTo = new Date(currentFrom);
  currentTo.setDate(currentTo.getDate() + 6);
  const previousFrom = new Date(currentFrom);
  previousFrom.setDate(previousFrom.getDate() - 7);
  const previousTo = new Date(currentTo);
  previousTo.setDate(previousTo.getDate() - 7);
  return {
    current: { from: dateKey(currentFrom), to: dateKey(currentTo) },
    previous: { from: dateKey(previousFrom), to: dateKey(previousTo) },
    label: 'esta semana',
  };
};
