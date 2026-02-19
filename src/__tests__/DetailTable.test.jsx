import React from "react";
import { render, screen } from "@testing-library/react";
import DetailTable from "../components/ui/DetailTable.jsx";

describe("DetailTable", () => {
  const rows = [
    { label: "Country",  value: "United States" },
    { label: "Carrier",  value: "AT&T", mono: true },
    { label: "Risk",     value: "Low",  accent: true },
  ];

  it("renders all row labels", () => {
    render(<DetailTable rows={rows} />);
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Carrier")).toBeInTheDocument();
    expect(screen.getByText("Risk")).toBeInTheDocument();
  });

  it("renders all row values", () => {
    render(<DetailTable rows={rows} />);
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("AT&T")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("renders empty rows without crashing", () => {
    const { container } = render(<DetailTable rows={[]} />);
    expect(container.firstChild).not.toBeNull();
  });
});
