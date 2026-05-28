export const getReadings = async (length = 1200) => {
  const current = Date.now();
  const hour = 1000 * 60 * 60;
  return [...new Array(length)].map((_, index) => ({
    time: current - index * hour,
    value: Math.random() * 0.7 + 0.4,
  }));
};

export const groupByDay = (readings) => {
  const groupedByDay = readings.reduce((curr, { time, value }) => {
    const readingDate = new Date(time);
    const day = new Date(
      readingDate.getFullYear(),
      readingDate.getMonth(),
      readingDate.getDate()
    ).getTime();
    if (!curr[day]) curr[day] = 0;
    curr[day] += value;
    return curr;
  }, {});

  return Object.entries(groupedByDay).map(([day, value]) => ({
    time: Number(day),
    value,
  }));
};

export const sortByTime = (readings) => {
  return [...readings].sort(
    (readingA, readingB) => readingA.time - readingB.time
  );
};

export const filterByDays = (readings, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return readings.filter(({ time }) => time >= cutoff);
};

export const getCurrentPower = (readings) => {
  if (!readings.length) return 0;
  return readings.reduce((latest, r) => (r.time > latest.time ? r : latest)).value;
};

export const getDailyAverage = (readings) => {
  const dailyTotals = groupByDay(readings);
  if (!dailyTotals.length) return 0;
  return dailyTotals.reduce((sum, { value }) => sum + value, 0) / dailyTotals.length;
};

export const getTotalConsumption = (readings) => {
  return readings.reduce((sum, { value }) => sum + value, 0);
};
