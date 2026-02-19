import React from "react";
import { render, screen } from "@testing-library/react";
import FlagItem from "../components/ui/FlagItem.jsx";

describe("FlagItem", () => {
  it("renders flag text", () => {
    render(<FlagItem type="warn" text="Suspicious domain detected" />);
    expect(screen.getByText("Suspicious domain detected")).toBeInTheDocument();
  });

  it("renders danger type without crashing", () => {
    const { container } = render(<FlagItem type="danger" text="High risk" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders info type without crashing", () => {
    const { container } = render(<FlagItem type="info" text="Info note" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders success type without crashing", () => {
    const { container } = render(<FlagItem type="success" text="All clear" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders warn type without crashing", () => {
    const { container } = render(<FlagItem type="warn" text="Warning" />);
    expect(container.firstChild).not.toBeNull();
  });
});
