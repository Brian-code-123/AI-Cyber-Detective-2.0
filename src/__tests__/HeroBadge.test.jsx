import React from "react";
import { render, screen } from "@testing-library/react";
import HeroBadge from "../components/ui/HeroBadge.jsx";

describe("HeroBadge", () => {
  it("renders children text", () => {
    render(<HeroBadge>Phone Inspector</HeroBadge>);
    expect(screen.getByText("Phone Inspector")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<HeroBadge icon="📞">Phone Inspector</HeroBadge>);
    expect(screen.getByText("📞")).toBeInTheDocument();
  });

  it("renders without icon without crashing", () => {
    const { container } = render(<HeroBadge>Tool</HeroBadge>);
    expect(container.firstChild).not.toBeNull();
  });
});
