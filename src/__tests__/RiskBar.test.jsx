import React from "react";
import { render, screen } from "@testing-library/react";
import RiskBar from "../components/ui/RiskBar.jsx";

describe("RiskBar", () => {
  it("shows LOW label for score <= 30", () => {
    render(<RiskBar score={10} />);
    expect(screen.getByText(/LOW/i)).toBeInTheDocument();
  });

  it("shows MEDIUM label for score 31-70", () => {
    render(<RiskBar score={50} />);
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
  });

  it("shows HIGH label for score 71-89", () => {
    render(<RiskBar score={80} />);
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
  });

  it("shows CRITICAL label for score >= 90", () => {
    render(<RiskBar score={95} />);
    expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
  });

  it("renders without crashing when showLabel is false", () => {
    const { container } = render(<RiskBar score={50} showLabel={false} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("handles null/undefined score gracefully", () => {
    const { container } = render(<RiskBar score={null} />);
    expect(container.firstChild).not.toBeNull();
  });
});
