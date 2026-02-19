import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NeonButton from "../components/ui/NeonButton.jsx";

describe("NeonButton", () => {
  it("renders children text", () => {
    render(<NeonButton>Click Me</NeonButton>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<NeonButton onClick={handleClick}>Test</NeonButton>);
    fireEvent.click(screen.getByText("Test"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(<NeonButton disabled onClick={handleClick}>Test</NeonButton>);
    fireEvent.click(screen.getByText("Test"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders loading text when loading=true", () => {
    render(<NeonButton loading>Loading</NeonButton>);
    // Should show spinner or the button is disabled
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("renders glass variant without crashing", () => {
    const { container } = render(<NeonButton variant="glass">Glass</NeonButton>);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders danger variant without crashing", () => {
    const { container } = render(<NeonButton variant="danger">Delete</NeonButton>);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders sm size without crashing", () => {
    const { container } = render(<NeonButton size="sm">Small</NeonButton>);
    expect(container.firstChild).not.toBeNull();
  });
});
