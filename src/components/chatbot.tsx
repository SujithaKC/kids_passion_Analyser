import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

interface ChatMessage {
  sender: "child" | "bot";
  text: string;
}

function ChildChatbot({ parentUid }: { parentUid: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Load available voices
  useEffect(() => {
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        const preferredVoice = findBestChildVoice(voices);
        setSelectedVoice(preferredVoice);
      };

      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // FIXED: Auto-scroll that actually works
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  }, [messages, loading]);

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find the most child-friendly voice
  const findBestChildVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const priorityPatterns = [
      /google uk english female/i,
      /google us english/i,
      /microsoft (.*) natural/i,
      /samantha/i,
      /karen/i,
      /moira/i,
      /tessa/i,
      /female/i,
    ];

    for (const pattern of priorityPatterns) {
      const voice = voices.find(v => pattern.test(v.name) && v.lang.startsWith('en'));
      if (voice) return voice;
    }

    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  };

  // Clean emojis and special characters for cleaner speech
  const cleanTextForSpeech = (text: string): string => {
    let cleanText = text.replace(/[#*`_~]/g, '');
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');
    
    const emojiMap: { [key: string]: string } = {
      '😊': 'smiling',
      '😂': 'laughing',
      '😍': 'heart eyes',
      '🤔': 'thinking',
      '👍': 'thumbs up',
      '👏': 'clapping',
      '🎉': 'celebrate',
      '✨': 'sparkles',
      '🌟': 'star',
      '⭐': 'star',
      '💡': 'idea',
      '📚': 'books',
      '🎨': 'art',
      '🎮': 'games',
      '🧩': 'puzzle',
      '🌈': 'rainbow',
      '🦄': 'unicorn',
      '🐶': 'dog',
      '🐱': 'cat',
      '🐼': 'panda',
      '🦁': 'lion',
      '🐨': 'koala',
      '🍎': 'apple',
      '🚀': 'rocket',
    };

    Object.entries(emojiMap).forEach(([emoji, word]) => {
      cleanText = cleanText.replace(new RegExp(emoji, 'g'), ` ${word} `);
    });

    cleanText = cleanText.replace(/[^\w\s.,!?;:'"()-]/g, ' ');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis || !voiceEnabled) return;

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.2;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ API key is missing. Please check your .env file." },
      ]);
      return;
    }

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "child", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // FIXED: Using correct Gemini model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a friendly and safe AI tutor for children. Follow these rules:
- Give educational and age-appropriate answers
- Be warm, encouraging, and use simple language
- Use **bold** for important words
- Add line breaks between ideas
- Keep responses concise and clear
- Never share inappropriate content
- Use emojis occasionally to be friendly 😊
- If you don't understand something, ask them to rephrase
- Be patient and encouraging even if they make spelling mistakes

Child's question: ${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", errorData);
        
        // Try fallback model if first one fails
        if (response.status === 404) {
          const fallbackResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are a friendly AI tutor for children. Answer this question in a simple, encouraging way: ${userMessage}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackReply = fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (fallbackReply) {
              setMessages((prev) => [...prev, { sender: "bot", text: fallbackReply }]);
              if (voiceEnabled) speakText(fallbackReply);
              setLoading(false);
              return;
            }
          }
        }
        
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Gemini Response:", data);

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!reply) {
        console.error("Unexpected API response structure:", data);
        throw new Error("No response content from API");
      }

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      
      if (voiceEnabled) {
        speakText(reply);
      }
    } catch (error) {
      console.error("Gemini error:", error);
      
      // More helpful error messages
      let errorMessage = "⚠️ Oops! I'm having trouble connecting. ";
      
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "⚠️ I need a moment to wake up. Please try again! 🌟";
        } else if (error.message.includes("429")) {
          errorMessage = "⚠️ I'm a little tired. Let's try again in a few seconds! 💫";
        } else if (error.message.includes("403")) {
          errorMessage = "⚠️ I need an adult to check my settings. 👨‍👩‍👧";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "⚠️ I can't reach my brain right now. Check your internet! 🌐";
        } else {
          errorMessage = "⚠️ Oops! Something went wrong. Please try again! 🌈";
        }
      }
      
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const replayMessage = (text: string) => {
    if (voiceEnabled) {
      speakText(text);
    }
  };

  const VoiceSelector = () => {
    if (availableVoices.length === 0) return null;

    return (
      <select
        onChange={(e) => {
          const voice = availableVoices.find(v => v.name === e.target.value);
          setSelectedVoice(voice || null);
        }}
        value={selectedVoice?.name || ''}
        className="text-xs bg-purple-100 border border-purple-300 rounded px-2 py-1 text-purple-700 max-w-[200px]"
      >
        <option value="">Auto-select best voice</option>
        {availableVoices
          .filter(v => v.lang.startsWith('en'))
          .map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name.replace('Microsoft', '').replace('Online', '').trim()}
            </option>
          ))}
      </select>
    );
  };

  return (
    <div className="flex flex-col h-full p-5 bg-purple-50 rounded-xl shadow-lg">
      {/* Voice Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={toggleVoice}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700"
            title={voiceEnabled ? "Mute voice" : "Enable voice"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <span className="text-sm text-purple-600 font-medium">
            {voiceEnabled ? "Voice on" : "Voice off"}
          </span>
          {voiceEnabled && <VoiceSelector />}
        </div>
        
        {isSpeaking && (
          <Button
            onClick={stopSpeaking}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700"
          >
            <Volume1 className="w-4 h-4 mr-1" />
            Stop
          </Button>
        )}
      </div>

      {/* Chat Window - with fixed scrolling */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-3 mb-3 p-2"
      >
        {messages.length === 0 && (
          <div className="text-center text-purple-400 py-8">
            👋 Hi! I'm your learning friend. Ask me anything!
          </div>
        )}
        
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl text-sm leading-relaxed break-words relative group ${
              m.sender === "child"
                ? "bg-purple-500 text-white self-end ml-auto max-w-[70%]"
                : "bg-white text-gray-900 self-start max-w-[85%] shadow-sm"
            }`}
          >
            <ReactMarkdown>{m.text}</ReactMarkdown>
            
            {m.sender === "bot" && voiceEnabled && (
              <button
                onClick={() => replayMessage(m.text)}
                className="absolute -bottom-6 right-0 text-xs text-purple-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" /> replay
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-white text-gray-700 p-4 rounded-2xl w-fit shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="ml-2 text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        {/* This div ensures scroll to bottom works */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />

        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-6"
        >
          Send
        </Button>
      </div>

      {/* Small tip about spelling */}
      {messages.length > 0 && (
        <div className="text-xs text-purple-400 mt-2 text-center">
          💡 Tip: You can ask anything! Don't worry about spelling mistakes.
        </div>
      )}
    </div>
  );
}

export default ChildChatbot;