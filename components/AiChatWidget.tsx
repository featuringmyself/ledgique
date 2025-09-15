"use client";

import { useState } from "react";
import { IconMessageCircle, IconX, IconSend } from "@tabler/icons-react";
import axios from "axios";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! How can I help you today?", isUser: false }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      
      axios.post("/api/aiChat", {
        message: message
      }).then(function(response){
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message || "Sorry, I couldn't process that.",
          isUser: false
        };
        console.log("RESPONSE: ",response)
        setMessages(prev => [...prev, aiMessage]);
      }).catch(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong.",
          isUser: false
        };
        setMessages(prev => [...prev, errorMessage]);
      });
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
      >
        {isOpen ? (
          <IconX className="h-6 w-6" />
        ) : (
          <IconMessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 h-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm ${
                  msg.isUser
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg max-w-xs ${
                    msg.isUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}