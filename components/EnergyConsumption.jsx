import { useEffect, useState } from "react";
import { renderChart } from "../utils/chart.js";
import { groupByDay, sortByTime, filterByDays } from "../utils/reading";

const TIME_RANGES = [7, 30, 90];
const CONTAINER_ID = "usageChart";

export const EnergyConsumption = ({ readings = [] }) => {
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    renderChart(CONTAINER_ID, sortByTime(groupByDay(filterByDays(readings, timeRange))));
  }, [readings, timeRange]);

  return (
    <>
      <h1 className="regular darkgray line-height-1 mb3">Energy consumption</h1>
      <section className="mb3">
        {TIME_RANGES.map((days) => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`h5 inline-block shadow-2 pl2 pr2 pt1 pb1 roundedMore border-grey bold mr1 ${
              timeRange === days ? "bg-blue white" : "bg-light-grey darkgray"
            }`}
          >
            Last {days} days
          </button>
        ))}
      </section>
      <section className="chartHeight mb3">
        <canvas id={CONTAINER_ID} />
      </section>
    </>
  );
};
