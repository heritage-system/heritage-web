import React, { useState, useRef, useEffect } from "react";

const ChatBoxAI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    // TODO: Gửi message tới AI và nhận phản hồi
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: "ai", text: "Đây là phản hồi mẫu từ AI." }]);
    }, 800);
  };

  return (
    <>
      {/* Icon Chat và text */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 group">
          <span className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-lg text-base font-medium transition-all duration-200 group-hover:bg-purple-50 group-hover:text-purple-700">
            Bạn có thắc mắc gì không?
          </span>
          <button
            className="bg-gradient-to-tr from-purple-600 to-pink-500 hover:scale-110 transition-transform duration-200 text-white rounded-full p-4 shadow-2xl border-4 border-white"
            onClick={() => setOpen(o => !o)}
            aria-label="Mở chat AI"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="white" opacity="0.2"/>
              <path d="M12 3C7.03 3 3 6.58 3 11c0 1.61.62 3.09 1.68 4.32L3 21l6.04-1.68C10.01 19.77 11 20 12 20c4.97 0 9-3.58 9-8s-4.03-9-9-9z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      )}

      {/* Chat Box */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[90vw] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-100 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-white bg-opacity-20 rounded-full p-2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="white" opacity="0.2"/>
                  <path d="M12 3C7.03 3 3 6.58 3 11c0 1.61.62 3.09 1.68 4.32L3 21l6.04-1.68C10.01 19.77 11 20 12 20c4.97 0 9-3.58 9-8s-4.03-9-9-9z" fill="currentColor"/>
                </svg>
              </span>
              <span className="font-semibold text-lg">Chat với AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-2xl font-bold px-2 transition">&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto max-h-80 bg-gradient-to-b from-purple-50 to-white">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">Chưa có tin nhắn nào...</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900"
                      : "bg-white text-gray-800 border border-purple-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex border-t bg-white px-2 py-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              disabled={!input.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
      {/* Hiệu ứng mở chat box */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeInChatBox 0.25s;
          }
          @keyframes fadeInChatBox {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </>
  );
};

export default ChatBoxAI;