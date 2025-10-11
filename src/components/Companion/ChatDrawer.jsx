import React, { useEffect, useMemo, useRef, useState } from "react";
import { companionStore, useCompanionStore } from "./useCompanionStore";
import { generateSupportResponse } from "../../utils/chatResponses";

const QUICK_CHIPS = ["I'm stressed", "I miss my family", "I can't sleep"];

function ChatDrawer() {
  const drawerOpen = useCompanionStore((s) => s.drawerOpen);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const logRef = useRef(null);
  const greetedRef = useRef(false);

  useEffect(() => {
    if (drawerOpen && !greetedRef.current) {
      setMessages([
        {
          sender: "MAITRI",
          html: `<p>Namaste, Commander. I can chat, track vitals, and suggest interventions.</p>`,
        },
      ]);
      greetedRef.current = true;
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, drawerOpen]);

  const handleSend = (payload = inputValue) => {
    const trimmed = (payload || "").trim();
    if (!trimmed) return;

    const userHtml = `<p>${trimmed}</p>`;
    const botHtml = generateSupportResponse(trimmed, "chat");

    setMessages((prev) => [
      ...prev,
      { sender: "You", html: userHtml },
      { sender: "MAITRI", html: botHtml },
    ]);
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const toggleLabel = useMemo(
    () => (drawerOpen ? "Close MAITRI Companion" : "Open MAITRI Companion"),
    [drawerOpen],
  );

  return (
    <>
      <div className="maitri-chat-trigger" aria-label="MAITRI companion chat">
        <button
          type="button"
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-2xl text-white shadow-[0_30px_70px_rgba(56,189,248,0.45)] transition hover:scale-105 focus:outline-none"
          aria-label={toggleLabel}
          onClick={() => companionStore.setOpen(!drawerOpen)}
        >
          💬
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-semibold text-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.8)]">
            ●
          </span>
        </button>
      </div>

      {drawerOpen && (
        <div className="maitri-chat-drawer">
          <div className="maitri-chat-drawer__header">
            <div>
              <p className="text-sm font-semibold text-white tracking-[0.18em] uppercase">
                Maitri Companion
              </p>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)]" />
                Online
              </p>
            </div>
            <button
              type="button"
              onClick={() => companionStore.setOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-lg text-sky-100 transition hover:bg-rose-500/80 hover:text-white"
              aria-label="Close chat drawer"
            >
              ×
            </button>
          </div>

          <div className="maitri-chat-drawer__body">
            <div ref={logRef} className="maitri-chat-drawer__messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`maitri-chat-message ${
                    message.sender === "MAITRI" ? "bot" : "user"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: message.html }} />
                </div>
              ))}
            </div>

            <div className="maitri-chat-drawer__chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="maitri-chat-chip"
                  onClick={() => handleSend(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="maitri-chat-drawer__actions">
            <textarea
              rows={2}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="maitri-chat-drawer__input"
            />
            <button
              type="button"
              className="maitri-chat-send"
              onClick={() => handleSend()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatDrawer;
