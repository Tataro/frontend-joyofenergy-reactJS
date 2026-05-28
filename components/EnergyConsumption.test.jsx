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
