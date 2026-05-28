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
