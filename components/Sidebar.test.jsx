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
