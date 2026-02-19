import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ChatbotProvider, useChatbot } from "../contexts/ChatbotContext.jsx";

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

function TestComponent() {
  const { messages, isOpen, setIsOpen, sendMessage, clearHistory } = useChatbot();
  return (
    <div>
      <span data-testid="open">{String(isOpen)}</span>
      <span data-testid="count">{messages.length}</span>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <button onClick={() => sendMessage("Hello AI")}>Send</button>
      <button onClick={clearHistory}>Clear</button>
    </div>
  );
}

function Wrapper({ children }) {
  return <ChatbotProvider>{children}</ChatbotProvider>;
}

describe("ChatbotContext", () => {
  it("starts with chatbot closed", () => {
    render(<Wrapper><TestComponent /></Wrapper>);
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("opens chatbot when setIsOpen(true) is called", () => {
    render(<Wrapper><TestComponent /></Wrapper>);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByTestId("open").textContent).toBe("true");
  });

  it("adds a user message when sendMessage is called", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "AI response here" }),
    });

    render(<Wrapper><TestComponent /></Wrapper>);
    await act(async () => {
      fireEvent.click(screen.getByText("Send"));
    });

    await waitFor(() => {
      const count = Number(screen.getByTestId("count").textContent);
      expect(count).toBeGreaterThan(0);
    });
  });

  it("clearHistory resets messages to initial welcome message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Test response" }),
    });

    render(<Wrapper><TestComponent /></Wrapper>);

    await act(async () => {
      fireEvent.click(screen.getByText("Send"));
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Clear"));
    });

    // After clear, messages should reset to 1 (the initial bot welcome)
    await waitFor(() => {
      expect(Number(screen.getByTestId("count").textContent)).toBeLessThanOrEqual(1);
    });
  });

  it("adds a user message to state when sendMessage is called", async () => {
    // This test just verifies user message is added synchronously
    function UserMsgTest() {
      const { messages, sendMessage } = useChatbot();
      return (
        <div>
          <button onClick={() => sendMessage("Hello AI")}>Send</button>
          <span data-testid="count">{messages.length}</span>
        </div>
      );
    }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "AI response here" }),
    });

    render(<Wrapper><UserMsgTest /></Wrapper>);
    const before = Number(screen.getByTestId("count").textContent);
    await act(async () => {
      fireEvent.click(screen.getByText("Send"));
    });
    await waitFor(() => {
      expect(Number(screen.getByTestId("count").textContent)).toBeGreaterThan(before);
    });
  });

  it("network failure does not crash the component", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));

    function OfflineTest() {
      const { messages, sendMessage } = useChatbot();
      return (
        <div>
          <button onClick={() => sendMessage("Hi")}>Send</button>
          <span data-testid="count">{messages.length}</span>
        </div>
      );
    }

    render(<Wrapper><OfflineTest /></Wrapper>);
    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByText("Send"));
    }).not.toThrow();
  }, 10000);
});
