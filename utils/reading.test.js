import {
  getReadings,
  groupByDay,
  sortByTime,
  filterByDays,
  getCurrentPower,
  getDailyAverage,
  getTotalConsumption,
} from "./reading";

describe("#reading", function () {
  describe("#getReadings", () => {
    it("should generate readings with specified length", async () => {
      const length = 100;
      expect(await getReadings(length)).toHaveLength(length);
    });

    it("should generate readings with timestamps and random values", async () => {
      const reading = (await getReadings(1))[0];

      expect(typeof reading.time).toBe("number");
      expect(typeof reading.value).toBe("number");
    });

    it("should generate readings by hours and ordered by time descending", async () => {
      const readings = await getReadings(4);

      expect(readings).toHaveLength(4);
      const OneHourInMilliseconds = 60 * 60 * 1000;
      expect(readings[0].time - readings[1].time).toBe(OneHourInMilliseconds);
      expect(readings[1].time - readings[2].time).toBe(OneHourInMilliseconds);
      expect(readings[2].time - readings[3].time).toBe(OneHourInMilliseconds);
    });
  });

  describe("#groupedByDay", () => {
    it("should get readings with timestamps and values", () => {
      const readings = [
        { time: new Date(2021, 12, 17, 10, 24).getTime(), value: 50 },
        {
          time: new Date(2021, 12, 17, 9, 24).getTime(),
          value: 40,
        },
        {
          time: new Date(2021, 12, 16, 10, 34).getTime(),
          value: 35,
        },
      ];

      const groupedReadings = groupByDay(readings);
      expect(groupedReadings).toHaveLength(2);
      expect(typeof groupedReadings[0].time).toBe("number");
      expect(typeof groupedReadings[0].value).toBe("number");
    });

    it("should get readings grouped by day", async () => {
      const readings = [
        { time: new Date(2021, 12, 17, 10, 24).getTime(), value: 50 },
        {
          time: new Date(2021, 12, 17, 9, 24).getTime(),
          value: 40,
        },
        {
          time: new Date(2021, 12, 16, 10, 34).getTime(),
          value: 35,
        },
        {
          time: new Date(2021, 12, 15, 11, 34).getTime(),
          value: 25,
        },
      ];

      const groupedReadings = groupByDay(readings);
      expect(groupedReadings).toHaveLength(3);
      expect(
        groupedReadings.find(
          (reading) => reading.time === new Date(2021, 12, 17).getTime()
        ).value
      ).toBe(90);
      expect(
        groupedReadings.find(
          (reading) => reading.time === new Date(2021, 12, 16).getTime()
        ).value
      ).toBe(35);
    });
  });

  describe("#sortByTime", () => {
    it("should put latest reading to the last", () => {
      const readings = [
        { time: new Date(2021, 12, 17, 10, 24).getTime(), value: 50 },
        {
          time: new Date(2021, 12, 17, 9, 24).getTime(),
          value: 40,
        },
        {
          time: new Date(2021, 12, 17, 11, 34).getTime(),
          value: 35,
        },
        {
          time: new Date(2021, 12, 15, 11, 34).getTime(),
          value: 25,
        },
      ];

      const sortedReading = sortByTime(readings);
      expect(sortedReading).toHaveLength(4);
      expect(sortedReading[0]).toMatchObject({
        time: new Date(2021, 12, 15, 11, 34).getTime(),
        value: 25,
      });
      expect(sortedReading[3]).toMatchObject({
        time: new Date(2021, 12, 17, 11, 34).getTime(),
        value: 35,
      });
    });

    it("should not change original array", () => {
      const readings = [
        { time: new Date(2021, 12, 17, 10, 24).getTime(), value: 50 },
        {
          time: new Date(2021, 12, 17, 9, 24).getTime(),
          value: 40,
        },
        {
          time: new Date(2021, 12, 15, 11, 34).getTime(),
          value: 25,
        },
      ];

      sortByTime(readings);
      expect(readings).toHaveLength(3);
      expect(readings).toEqual([
        { time: new Date(2021, 12, 17, 10, 24).getTime(), value: 50 },
        {
          time: new Date(2021, 12, 17, 9, 24).getTime(),
          value: 40,
        },
        {
          time: new Date(2021, 12, 15, 11, 34).getTime(),
          value: 25,
        },
      ]);
    });
  });

  describe("#filterByDays", () => {
    it("should return only readings within the last N days", () => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const readings = [
        { time: now - 1 * day, value: 1 },
        { time: now - 6 * day, value: 2 },
        { time: now - 8 * day, value: 3 },
      ];
      const result = filterByDays(readings, 7);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.value)).toEqual(expect.arrayContaining([1, 2]));
    });

    it("should return empty array when all readings are outside the range", () => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const readings = [{ time: now - 100 * day, value: 1 }];
      expect(filterByDays(readings, 7)).toHaveLength(0);
    });

    it("should return all readings when all are within range", () => {
      const now = Date.now();
      const readings = [
        { time: now - 1000, value: 1 },
        { time: now - 2000, value: 2 },
      ];
      expect(filterByDays(readings, 7)).toHaveLength(2);
    });
  });

  describe("#getCurrentPower", () => {
    it("should return the value of the most recent reading", () => {
      const readings = [
        { time: 1000, value: 0.3 },
        { time: 3000, value: 0.7 },
        { time: 2000, value: 0.5 },
      ];
      expect(getCurrentPower(readings)).toBe(0.7);
    });

    it("should return 0 for empty readings", () => {
      expect(getCurrentPower([])).toBe(0);
    });
  });

  describe("#getDailyAverage", () => {
    it("should return the mean of daily totals", () => {
      const readings = [
        { time: new Date(2021, 0, 1, 10).getTime(), value: 0.5 },
        { time: new Date(2021, 0, 1, 11).getTime(), value: 0.5 },
        { time: new Date(2021, 0, 2, 10).getTime(), value: 0.6 },
      ];
      // day 1 total = 1.0, day 2 total = 0.6, average = 0.8
      expect(getDailyAverage(readings)).toBeCloseTo(0.8);
    });

    it("should return 0 for empty readings", () => {
      expect(getDailyAverage([])).toBe(0);
    });
  });

  describe("#getTotalConsumption", () => {
    it("should return the sum of all reading values", () => {
      const readings = [
        { time: 1000, value: 0.3 },
        { time: 2000, value: 0.5 },
        { time: 3000, value: 0.2 },
      ];
      expect(getTotalConsumption(readings)).toBeCloseTo(1.0);
    });

    it("should return 0 for empty readings", () => {
      expect(getTotalConsumption([])).toBe(0);
    });
  });

});
