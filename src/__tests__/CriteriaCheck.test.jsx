import React from "react";
import { render, screen } from "@testing-library/react";
import CriteriaCheck from "../components/ui/CriteriaCheck.jsx";

describe("CriteriaCheck", () => {
  it("renders the label text", () => {
    render(<CriteriaCheck label="Has uppercase letter" passing={true} />);
    expect(screen.getByText("Has uppercase letter")).toBeInTheDocument();
  });

  it("shows check mark when passing=true", () => {
    render(<CriteriaCheck label="Has number" passing={true} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("shows dot/X when passing=false", () => {
    render(<CriteriaCheck label="Has symbol" passing={false} />);
    // Should not show the passing checkmark
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("renders without crashing when passing is undefined", () => {
    const { container } = render(<CriteriaCheck label="Test" />);
    expect(container.firstChild).not.toBeNull();
  });
});
