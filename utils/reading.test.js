import { getReadings, groupByDay, sortByTime, filterByDays } from "./reading";

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

});
