"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const suggestions = ["Track order", "Product consultation", "Return policy", "Contact support"];

const initialMessages: Message[] = [
  { id: 1, from: "bot", text: "Hello! Great to see you. How can ShopX help you today?" },
  { id: 2, from: "user", text: "I want to check my order status." },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().getTime();
    const userMsg: Message = { id: now, from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const botReply: Message = {
        id: now + 1,
        from: "bot",
        text: "Thanks for contacting us! We'll assist you right away.",
      };
      setMessages((prev) => [...prev, botReply]);
    }, 900);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#ff6a00" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
            {open ? "close" : "chat"}
          </span>
        </button>
      </div>

      {/* Chat Panel */}
      <div
        className="fixed bottom-24 right-6 w-[380px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-[60] transition-all duration-300"
        style={{
          height: 580,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 py-4 text-white flex-shrink-0"
          style={{ backgroundColor: "#ff6a00" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>smart_toy</span>
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Live support</h2>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-green-400 rounded-full"
                  style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
                />
                <span className="text-xs font-medium opacity-90">ShopX Bot is online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>close</span>
          </button>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          style={{ backgroundColor: "#f8fafc" }}
        >
          {messages.map((msg) =>
            msg.from === "bot" ? (
              <div key={msg.id} className="flex items-end gap-2.5">
                <div
                  className="rounded-full p-1.5 shrink-0"
                  style={{ backgroundColor: "rgba(255, 106, 0, 0.1)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#ff6a00" }}>smart_toy</span>
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <p className="text-[11px] font-medium text-slate-500 ml-1">ShopX Bot</p>
                  <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-white text-slate-800 shadow-sm border border-slate-100">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-end gap-2.5 justify-end">
                <div className="flex flex-col gap-1 items-end max-w-[80%]">
                  <p className="text-[11px] font-medium text-slate-500 mr-1">You</p>
                  <div
                    className="rounded-2xl rounded-br-none px-4 py-3 text-white shadow-sm"
                    style={{ backgroundColor: "#ff6a00" }}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Suggestions */}
        <div
          className="px-4 py-3 border-t border-slate-100 flex-shrink-0"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Suggestions for you
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="shrink-0 px-4 py-2 rounded-full border bg-white text-xs font-semibold transition-all"
                style={{ color: "#ff6a00", borderColor: "rgba(255,106,0,0.3)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff6a00";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = "#ff6a00";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <button className="p-1.5 text-slate-400 hover:text-[#ff6a00] transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>attach_file</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 py-1 outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button
              onClick={() => sendMessage(input)}
              className="w-9 h-9 text-white rounded-lg flex items-center justify-center shadow-md transition-opacity"
              style={{ backgroundColor: "#ff6a00" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3">Powered by ShopX AI Support</p>
        </div>
      </div>
    </>
  );
}
