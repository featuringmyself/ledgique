"use client";

import { useState, useRef, useEffect } from "react";
import { IconMessageCircle, IconX, IconSend, IconLoader2 } from "@tabler/icons-react";
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
    { id: "1", text: "Hello! I'm Ledgique AI. How can I help you with your accounting today?", isUser: false }
  ]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; parts: Array<{ text: string }> }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = message;
      setMessage("");
      setIsLoading(true);
      
      try {
        const response = await axios.post("/api/aiChat", {
          message: currentMessage,
          chatHistory: chatHistory
        });
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message || "Sorry, I couldn't process that.",
          isUser: false
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (response.data.chatHistory) {
          setChatHistory(response.data.chatHistory);
        }
      } catch (_error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong. Please try again.",
          isUser: false
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
      >
        <div className="relative">
          {isOpen ? (
            <IconX className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <IconMessageCircle className="h-6 w-6 transition-transform duration-200" />
          )}
          {/* {!isOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )} */}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      <div className={`fixed bottom-20 right-6 z-40 w-96 h-[32rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300  ${
        isOpen 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ledgique AI</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your accounting assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.isUser ? "flex-row-reverse" : "flex-row"}`}>
                  {!msg.isUser && (
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.isUser
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&#39;/g, "'")
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>')
                        .replace(/^\s*\*\s+(.*)$/gm, '<li>$1</li>')
                        .replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul class="list-disc ml-4 space-y-1">$1</ul>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">L</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask me about expenses, clients, invoices..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <IconSend className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send • Powered by Ledgique AI
            </p>
          </div>
        </div>
    </>
  );
}