# JOI Energy Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the coding exercise by fixing two bugs, adding time-range filtering, loading/error states, and dynamic sidebar stats derived from readings data.

**Architecture:** Approach B (co-located state) — `App.jsx` owns fetch state (loading/error/readings), `EnergyConsumption` owns time-range state and filters its own data, `Sidebar` receives full readings and computes stats.

**Tech Stack:** React 19, Vite 6, Chart.js 3, BassCSS utility classes, Vitest + @testing-library/react.

---

## File Map

| File | Change |
|---|---|
| `utils/chart.js` | Fix font.size type bug (line 18) |
| `utils/reading.js` | Add `filterByDays`, `getCurrentPower`, `getDailyAverage`, `getTotalConsumption` |
| `utils/reading.test.js` | Add tests for the four new utilities |
| `components/App.jsx` | Add `loading` / `error` state; pass `readings` to Sidebar |
| `components/App.test.jsx` | Replace with full suite including loading + error tests |
| `components/EnergyConsumption.jsx` | Add `timeRange` state + buttons; fix `useEffect` deps |
| `components/EnergyConsumption.test.jsx` | New file — test buttons and active state |
| `components/Sidebar.jsx` | Accept `readings` prop; compute stats via utility functions |
| `components/Sidebar.test.jsx` | New file — test computed stat values |

---

## Task 1: Fix chart.js font.size type bug

**Files:**
- Modify: `utils/chart.js:18`

- [ ] **Step 1: Change the string to a number**

In `utils/chart.js`, change line 18 from:
```js
chartJs.Chart.defaults.font.size = "10px";
```
to:
```js
chartJs.Chart.defaults.font.size = 10;
```

- [ ] **Step 2: Run existing tests to confirm nothing broke**

```bash
npm test
```
Expected: `3 passed` (all existing tests still green).

- [ ] **Step 3: Commit**

```bash
git add utils/chart.js
git commit -m "fix: set Chart.js font.size as number not string"
```

---

## Task 2: Add filterByDays utility (TDD)

**Files:**
- Modify: `utils/reading.js`
- Modify: `utils/reading.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `utils/reading.test.js` (inside the outer `describe` block or after it — either is fine):

```js
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
```

Update the import at the top of `utils/reading.test.js` to include `filterByDays`:
```js
import { getReadings, groupByDay, sortByTime, filterByDays } from "./reading";
```

- [ ] **Step 2: Run to confirm the tests fail**

```bash
npm test utils/reading.test.js
```
Expected: FAIL — `filterByDays is not a function` (or similar).

- [ ] **Step 3: Implement filterByDays in reading.js**

Append to `utils/reading.js`:
```js
export const filterByDays = (readings, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return readings.filter(({ time }) => time >= cutoff);
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test utils/reading.test.js
```
Expected: `10 passed` (7 original + 3 new).

- [ ] **Step 5: Commit**

```bash
git add utils/reading.js utils/reading.test.js
git commit -m "feat: add filterByDays utility to reading.js"
```

---

## Task 3: Add stat utility functions (TDD)

**Files:**
- Modify: `utils/reading.js`
- Modify: `utils/reading.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `utils/reading.test.js`:

```js
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
```

Update the import at the top of `utils/reading.test.js`:
```js
import {
  getReadings,
  groupByDay,
  sortByTime,
  filterByDays,
  getCurrentPower,
  getDailyAverage,
  getTotalConsumption,
} from "./reading";
```

- [ ] **Step 2: Run to confirm the tests fail**

```bash
npm test utils/reading.test.js
```
Expected: FAIL — `getCurrentPower is not a function` (or similar).

- [ ] **Step 3: Implement the three stat functions in reading.js**

Append to `utils/reading.js`:
```js
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test utils/reading.test.js
```
Expected: `16 passed` (10 previous + 6 new).

- [ ] **Step 5: Commit**

```bash
git add utils/reading.js utils/reading.test.js
git commit -m "feat: add getCurrentPower, getDailyAverage, getTotalConsumption utilities"
```

---

## Task 4: Update App.jsx with loading and error states (TDD)

**Files:**
- Modify: `components/App.jsx`
- Modify: `components/App.test.jsx`

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `components/App.test.jsx` with:

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { App } from "./App.jsx";
import { getReadings } from "../utils/reading";

vi.mock("../utils/chart.js");
vi.mock("../utils/reading", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getReadings: vi.fn() };
});

const mockReadings = Array.from({ length: 24 }, (_, i) => ({
  time: Date.now() - i * 3600000,
  value: 0.5,
}));

beforeEach(() => {
  getReadings.mockResolvedValue(mockReadings);
});

describe("App", () => {
  it("renders loading state initially", () => {
    getReadings.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders energy dashboard after loading", async () => {
    render(<App />);
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Energy consumption");
  });

  it("renders error state when fetch fails", async () => {
    getReadings.mockRejectedValue(new Error("Network error"));
    render(<App />);
    const error = await screen.findByText("Error: Network error");
    expect(error).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

```bash
npm test components/App.test.jsx
```
Expected: FAIL — loading and error tests fail because App doesn't have those states yet.

- [ ] **Step 3: Implement loading/error state in App.jsx**

Replace the entire contents of `components/App.jsx` with:

```jsx
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { EnergyConsumption } from "./EnergyConsumption.jsx";
import { getReadings } from "../utils/reading";

export const App = () => {
  const [readings, setReadings] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReadings()
      .then(setReadings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="background shadow-2 flex overflow-hidden">
      <aside className="p3 menuWidth overflow-auto">
        <Sidebar readings={readings} />
      </aside>
      <article className="bg-very-light-grey p3 flex-auto overflow-auto">
        <EnergyConsumption readings={readings} />
      </article>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test components/App.test.jsx
```
Expected: `3 passed`.

- [ ] **Step 5: Run all tests to confirm nothing regressed**

```bash
npm test
```
Expected: all tests pass (Sidebar.jsx now receives `readings` prop but still renders with hardcoded values — that's fine, Sidebar will be fixed in Task 6).

- [ ] **Step 6: Commit**

```bash
git add components/App.jsx components/App.test.jsx
git commit -m "feat: add loading and error states to App"
```

---

## Task 5: Update EnergyConsumption with time-range filtering (TDD)

**Files:**
- Create: `components/EnergyConsumption.test.jsx`
- Modify: `components/EnergyConsumption.jsx`

- [ ] **Step 1: Write the failing tests**

Create `components/EnergyConsumption.test.jsx`:

```jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect } from "vitest";
import { EnergyConsumption } from "./EnergyConsumption.jsx";

vi.mock("../utils/chart.js");

const mockReadings = Array.from({ length: 24 }, (_, i) => ({
  time: Date.now() - i * 3600000,
  value: 0.5,
}));

describe("EnergyConsumption", () => {
  it("renders three time-range buttons", () => {
    render(<EnergyConsumption readings={mockReadings} />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Last 90 days")).toBeInTheDocument();
  });

  it("defaults to Last 30 days as the active button", () => {
    render(<EnergyConsumption readings={mockReadings} />);
    const active = screen.getByText("Last 30 days");
    expect(active.className).toContain("bg-blue");
    expect(active.className).toContain("white");
  });

  it("marks inactive buttons with bg-light-grey class", () => {
    render(<EnergyConsumption readings={mockReadings} />);
    const inactive = screen.getByText("Last 7 days");
    expect(inactive.className).toContain("bg-light-grey");
  });

  it("switches active button when a different range is clicked", () => {
    render(<EnergyConsumption readings={mockReadings} />);
    fireEvent.click(screen.getByText("Last 7 days"));
    expect(screen.getByText("Last 7 days").className).toContain("bg-blue");
    expect(screen.getByText("Last 30 days").className).toContain("bg-light-grey");
  });
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

```bash
npm test components/EnergyConsumption.test.jsx
```
Expected: FAIL — "Last 7 days" button not found, etc.

- [ ] **Step 3: Implement the updated EnergyConsumption component**

Replace the entire contents of `components/EnergyConsumption.jsx` with:

```jsx
import { useEffect, useState } from "react";
import { renderChart } from "../utils/chart.js";
import { groupByDay, sortByTime, filterByDays } from "../utils/reading";

const TIME_RANGES = [7, 30, 90];

export const EnergyConsumption = ({ readings }) => {
  const containerId = "usageChart";
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    renderChart(containerId, sortByTime(groupByDay(filterByDays(readings, timeRange))));
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
        <canvas id={containerId} />
      </section>
    </>
  );
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test components/EnergyConsumption.test.jsx
```
Expected: `4 passed`.

- [ ] **Step 5: Run all tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/EnergyConsumption.jsx components/EnergyConsumption.test.jsx
git commit -m "feat: add time-range filtering to EnergyConsumption and fix useEffect deps"
```

---

## Task 6: Update Sidebar with dynamic stats (TDD)

**Files:**
- Create: `components/Sidebar.test.jsx`
- Modify: `components/Sidebar.jsx`

- [ ] **Step 1: Write the failing tests**

Create `components/Sidebar.test.jsx`:

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { Sidebar } from "./Sidebar.jsx";

// Two readings on the same day: most recent has value 0.7
const mockReadings = [
  { time: new Date(2021, 0, 1, 12, 0).getTime(), value: 0.5 },
  { time: new Date(2021, 0, 1, 13, 0).getTime(), value: 0.7 },
];

describe("Sidebar", () => {
  it("shows current power draw from the most recent reading", () => {
    render(<Sidebar readings={mockReadings} />);
    expect(screen.getByText("⚡️ 0.70kW")).toBeInTheDocument();
  });

  it("shows daily average consumption", () => {
    // Both readings are on the same day: daily total = 1.2, avg = 1.2 (one day)
    render(<Sidebar readings={mockReadings} />);
    expect(screen.getByText("☀️️ 1.20kWh/day")).toBeInTheDocument();
  });

  it("shows total consumption", () => {
    // 0.5 + 0.7 = 1.2 → formatted to 1 decimal
    render(<Sidebar readings={mockReadings} />);
    expect(screen.getByText("🔌️ 1.2kWh")).toBeInTheDocument();
  });

  it("still shows the device list section", () => {
    render(<Sidebar readings={mockReadings} />);
    expect(screen.getByText("Your devices:")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm the tests fail**

```bash
npm test components/Sidebar.test.jsx
```
Expected: FAIL — Sidebar doesn't accept a `readings` prop yet and still renders hardcoded values.

- [ ] **Step 3: Implement the updated Sidebar component**

Replace the entire contents of `components/Sidebar.jsx` with:

```jsx
import { getCurrentPower, getDailyAverage, getTotalConsumption } from "../utils/reading";

const DeviceSection = ({ title, usage }) => (
  <div className="shadow-2 roundedMore bg-super-light-grey mb1">
    <p className="darkgray pl2 pt1 pb1">{title}</p>
    <p className="h5 darkgray bold pl2 pb1 pt1 bg-very-light-grey">{usage}</p>
  </div>
);

const SummarySection = ({ summary, subtitle }) => (
  <>
    <h2 className="h2 greyBlue">{summary}</h2>
    <p className="darkgray mb2">{subtitle}</p>
  </>
);

export const Sidebar = ({ readings }) => (
  <>
    <SummarySection
      summary={`⚡️ ${getCurrentPower(readings).toFixed(2)}kW`}
      subtitle="Power draw"
    />
    <SummarySection
      summary={`☀️️ ${getDailyAverage(readings).toFixed(2)}kWh/day`}
      subtitle="Daily average"
    />
    <SummarySection
      summary={`🔌️ ${getTotalConsumption(readings).toFixed(1)}kWh`}
      subtitle="Total consumption"
    />

    <section className="h5 darkgray mb2">
      <h4 className="h4 mb1">Your devices:</h4>
      <DeviceSection title="Air conditioner" usage="0.3093kW" />
      <DeviceSection title="Wi-Fi router" usage="0.0033kW" />
      <DeviceSection title="Humidifer" usage="0.0518kW" />
      <DeviceSection title="Smart TV" usage="0.1276kW" />
      <DeviceSection title="Diffuser" usage="0.0078kW" />
      <DeviceSection title="Refrigerator" usage="0.0923kW" />
    </section>
  </>
);
```

- [ ] **Step 4: Run the Sidebar tests to confirm they pass**

```bash
npm test components/Sidebar.test.jsx
```
Expected: `4 passed`.

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```
Expected: all test files pass. Final count: reading.test.js (16) + chart.test.js (1) + App.test.jsx (3) + EnergyConsumption.test.jsx (4) + Sidebar.test.jsx (4) = 28 tests total.

- [ ] **Step 6: Commit**

```bash
git add components/Sidebar.jsx components/Sidebar.test.jsx
git commit -m "feat: compute dynamic stats in Sidebar from readings data"
```
