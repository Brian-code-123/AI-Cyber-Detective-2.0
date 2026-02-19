import React from "react";
import { render, screen } from "@testing-library/react";
import AuthBadge from "../components/ui/AuthBadge.jsx";

describe("AuthBadge", () => {
  it("renders label text", () => {
    render(<AuthBadge label="SPF" status="pass" />);
    expect(screen.getByText("SPF")).toBeInTheDocument();
  });

  it("shows pass indicator (✓) for pass status", () => {
    render(<AuthBadge label="DKIM" status="pass" />);
    // AuthBadge shows ✓ icon for pass
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("shows fail indicator (✗) for fail status", () => {
    render(<AuthBadge label="DMARC" status="fail" />);
    expect(screen.getByText("✗")).toBeInTheDocument();
  });

  it("shows warn indicator (⚠) for warn status", () => {
    render(<AuthBadge label="SPF" status="warn" />);
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });

  it("renders without crashing when status is unknown", () => {
    const { container } = render(<AuthBadge label="Test" status="unknown" />);
    expect(container.firstChild).not.toBeNull();
  });
});
