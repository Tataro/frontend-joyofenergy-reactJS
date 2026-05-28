# JOI Energy Dashboard — Completion Design

**Date:** 2026-05-28  
**Scope:** Complete the coding exercise: fix bugs, dynamic sidebar stats, time-range filtering, loading/error states.  
**Approach:** Approach B — co-located state; chart owns time-range, App owns fetch state, Sidebar derives stats from readings.

---

## Architecture

```
App.jsx
  ├── state: readings, loading, error
  ├── renders: <LoadingState /> | <ErrorState /> | layout
  │
  ├── <Sidebar readings={readings} />
  │     └── computes stats from readings (current draw, daily avg, total)
  │
  └── <EnergyConsumption readings={readings} />
        ├── state: timeRange (7 | 30 | 90, default 30)
        ├── derives: filteredReadings = filterByDays(readings, timeRange)
        └── renders: time-range buttons + Chart.js bar chart
```

---

## Components

### App.jsx
- State: `readings` (array | undefined), `loading` (boolean, starts true), `error` (string | null)
- On mount: calls `getReadings()`, sets readings on success, sets error message on failure, sets loading false either way
- Renders `<p>Loading...</p>` while loading
- Renders `<p>Error: {message}</p>` on error
- On success: renders existing sidebar/article layout with `<Sidebar readings={readings} />` and `<EnergyConsumption readings={readings} />`

### EnergyConsumption.jsx
- Props: `readings` (array)
- State: `timeRange` (number of days, default 30)
- Derives `filteredReadings` by calling `sortByTime(groupByDay(filterByDays(readings, timeRange)))` — `filterByDays` limits raw readings to the last N days, then they are grouped and sorted
- `useEffect` depends on `filteredReadings` — re-renders chart whenever filtered data changes (fixes empty-deps bug)
- Renders three buttons: "Last 7 days", "Last 30 days", "Last 90 days"; active button uses existing `bg-blue white` classes, inactive uses `bg-light-grey darkgray`

### Sidebar.jsx
- Props: `readings` (array)
- Computes three stats using utility functions:
  - `getCurrentPower(readings)` — last reading's value, formatted to 2 decimal places as `{n}kW`
  - `getDailyAverage(readings)` — mean of daily-grouped totals, formatted to 2 decimal places as `{n}kWh/day`
  - `getTotalConsumption(readings)` — sum of all reading values, formatted to 1 decimal place as `{n}kWh`
- Replaces the three hardcoded `SummarySection` values
- Device list remains unchanged (no per-device data available)

---

## Utilities (reading.js additions)

### `filterByDays(readings, days)`
Returns readings where `time >= Date.now() - days * 24 * 60 * 60 * 1000`.

### `getCurrentPower(readings)`
Returns the `value` of the reading with the highest `time`. Returns `0` if readings is empty.

### `getDailyAverage(readings)`
Groups readings by day, returns the mean of the daily totals. Returns `0` if no data.

### `getTotalConsumption(readings)`
Returns the sum of all reading `value`s. Returns `0` if empty.

---

## Bug Fixes

| Location | Bug | Fix |
|---|---|---|
| `utils/chart.js:18` | `font.size = "10px"` — string, Chart.js expects number | Change to `10` |
| `components/EnergyConsumption.jsx:8` | `useEffect(…, [])` — never re-renders chart on data change | Add `filteredReadings` to deps array |

---

## Testing

- `utils/reading.test.js` — add tests for `filterByDays`, `getCurrentPower`, `getDailyAverage`, `getTotalConsumption`
- `components/App.test.jsx` — add test for loading state render, existing heading test unchanged
- `components/EnergyConsumption.test.jsx` — test that time-range buttons render and that the active button has correct class
- `components/Sidebar.test.jsx` — test that computed stats render (mock readings with known values)

---

## Out of Scope

- Real backend API integration (exercise uses mock data only)
- Per-device reading data (no data structure available)
- Date-range picker (three fixed buttons are sufficient)
