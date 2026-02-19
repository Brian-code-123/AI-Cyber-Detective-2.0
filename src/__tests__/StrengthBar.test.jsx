import React from "react";
import { render, screen } from "@testing-library/react";
import StrengthBar from "../components/ui/StrengthBar.jsx";

describe("StrengthBar", () => {
  it("renders Very Weak label for score 0", () => {
    render(<StrengthBar score={0} />);
    expect(screen.getByText(/Very Weak/i)).toBeInTheDocument();
  });

  it("renders Weak label for score 1", () => {
    render(<StrengthBar score={1} />);
    expect(screen.getByText(/Weak/i)).toBeInTheDocument();
  });

  it("renders Fair label for score 2", () => {
    render(<StrengthBar score={2} />);
    expect(screen.getByText(/Fair/i)).toBeInTheDocument();
  });

  it("renders Strong label for score 3", () => {
    render(<StrengthBar score={3} />);
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();
  });

  it("renders Very Strong label for score 4", () => {
    render(<StrengthBar score={4} />);
    expect(screen.getByText(/Very Strong/i)).toBeInTheDocument();
  });

  it("renders without crashing for any valid score 0-4", () => {
    for (let i = 0; i <= 4; i++) {
      const { unmount } = render(<StrengthBar score={i} />);
      unmount();
    }
  });
});
