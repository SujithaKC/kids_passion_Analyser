import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  sender: "child" | "bot";
  text: string;
}

function ChildChatbot({ parentUid }: { parentUid: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // ✅ Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    setMessages((prev) => [...prev, { sender: "child", text: input }]);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a **child-safe AI tutor**. 
- Only give educational, safe, and age-appropriate answers.  
- Never include harmful, unsafe, or non-educational content.  
- Use **bold** for key points.  
- Use line breaks for readability.  
- Be friendly and encouraging, like a teacher helping a child.  

Child: ${input}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I don’t know that.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Oops! Something went wrong." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full p-5 bg-purple-50 rounded-xl shadow-lg">
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl text-sm leading-relaxed break-words ${
              m.sender === "child"
                ? "bg-purple-500 text-white self-end ml-auto max-w-[50%]"
                : "bg-purple-100 text-gray-900 self-start max-w-[85%]"
            }`}
          >
            <ReactMarkdown>{m.text}</ReactMarkdown>
          </div>
        ))}
        {loading && (
          <div className="bg-purple-200 text-gray-700 p-2 rounded-xl w-fit italic">
            Typing...
          </div>
        )}
        {/* ✅ Always scroll to last message */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
     <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default ChildChatbot;
