import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nProvider, useI18n } from "../contexts/I18nContext.jsx";

function TestComponent() {
  const { lang, t, toggleLang } = useI18n();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="dashboard">{t("nav.dashboard")}</span>
      <button onClick={toggleLang}>Toggle Lang</button>
    </div>
  );
}

describe("I18nContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides default language", () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    const langEl = screen.getByTestId("lang");
    expect(["en", "zh"]).toContain(langEl.textContent);
  });

  it("returns English translation for nav.dashboard", () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    // Make sure lang is 'en' first
    const langEl = screen.getByTestId("lang");
    if (langEl.textContent !== "en") {
      fireEvent.click(screen.getByText("Toggle Lang"));
    }
    expect(screen.getByTestId("dashboard").textContent).toBe("Dashboard");
  });

  it("toggles language between en and zh", () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    const initial = screen.getByTestId("lang").textContent;
    fireEvent.click(screen.getByText("Toggle Lang"));
    const after = screen.getByTestId("lang").textContent;
    expect(after).not.toBe(initial);
  });

  it("returns key as fallback for missing translation key", () => {
    function FallbackTest() {
      const { t } = useI18n();
      return <span data-testid="missing">{t("this.key.does.not.exist")}</span>;
    }
    render(
      <I18nProvider>
        <FallbackTest />
      </I18nProvider>
    );
    expect(screen.getByTestId("missing").textContent).toBe("this.key.does.not.exist");
  });
});
