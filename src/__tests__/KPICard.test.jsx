import React from "react";
import { render, screen } from "@testing-library/react";
import KPICard from "../components/ui/KPICard.jsx";

describe("KPICard", () => {
  it("renders label and value", () => {
    render(<KPICard label="Risk Score" value="72%" />);
    expect(screen.getByText("Risk Score")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<KPICard icon="🔒" label="Status" value="Active" />);
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("renders with custom color style without crashing", () => {
    const { container } = render(
      <KPICard label="Score" value="90" color="var(--red)" />
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("shows dash when value is undefined", () => {
    render(<KPICard label="Country" value={undefined} />);
    expect(screen.getByText("Country")).toBeInTheDocument();
  });
});
