import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext.jsx";

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("provides a default theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    // should show either 'dark' or 'light'
    const themeEl = screen.getByTestId("theme");
    expect(["dark", "light"]).toContain(themeEl.textContent);
  });

  it("toggles theme when toggleTheme is called", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const initial = screen.getByTestId("theme").textContent;
    fireEvent.click(screen.getByText("Toggle"));
    const after = screen.getByTestId("theme").textContent;
    expect(after).not.toBe(initial);
  });

  it("persists theme to localStorage", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("Toggle"));
    // localStorage should now have a theme value
    const stored = localStorage.getItem("nt-theme");
    expect(stored).toBeTruthy();
  });
});
