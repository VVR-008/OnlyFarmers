// /app/chat/page.tsx

'use client';
import React, { useState, useRef } from 'react';

type Message = { role: "user" | "ai"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am your Farm AI assistant powered by Gemini. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim()) return;
    const nextMessages = [
      ...messages,
      { role: "user" as const, content: userInput }
    ];  
    setMessages(nextMessages);
    setLoading(true);

    try {
      const chatPayload = nextMessages.map(m =>
        ({ role: m.role === "ai" ? "model" : "user", content: m.content }));

      const res = await fetch("/api/gemini", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const { text } = await res.json();

      setMessages([ ...nextMessages, { role: "ai" as const, content: text || "Sorry, no answer." } ]);
      setUserInput("");
      inputRef.current?.focus();
    } catch (err) {
      setMessages([ ...nextMessages, { role: "ai", content: "Sorry, something went wrong." } ]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 rounded-lg shadow bg-white dark:bg-neutral-800 min-h-[70vh] flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Agri AI Assistant</h1>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-fit rounded px-4 py-2 ${msg.role === "user" ? "ml-auto bg-green-200 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && <div className="italic text-gray-400">Thinking…</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-1">
        <input
          ref={inputRef}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded border dark:bg-neutral-900"
          placeholder="Ask about farming, weather, crops…"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          aria-label="Type your question"
        />
        <button type="submit" disabled={loading || !userInput.trim()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Send
        </button>
      </form>
      <div className="text-xs opacity-60 mt-2">
        Powered by Gemini Pro. Do not send sensitive information.
      </div>
    </div>
  );
}
