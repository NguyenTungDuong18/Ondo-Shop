import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Loader2, ShoppingBag } from 'lucide-react';
import { API_BASE_URL } from '../../api/axiosClient';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  status: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
}

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI của MySystem. Bạn cần tìm hiểu thông tin về sản phẩm nào hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setIsLoading(true);
    setMessages((prev) => [...prev, { id: aiMsgId, sender: 'ai', text: '' }]);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: 'Vui lòng đăng nhập vào hệ thống để bắt đầu trò chuyện với Trợ lý AI!' }
            : msg
        )
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/RagChat/AskStream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question: userText }),
      });

      if (!response.ok) throw new Error('Yêu cầu không thành công');
      if (!response.body) throw new Error('Không nhận được luồng dữ liệu từ máy chủ');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataContent = trimmed.substring(6).trim();
          if (dataContent.startsWith('[PRODUCTS]:')) {
            try {
              const productsList = JSON.parse(dataContent.substring(11)) as Product[];
              setMessages((prev) =>
                prev.map((msg) => msg.id === aiMsgId ? { ...msg, products: productsList } : msg)
              );
            } catch (err) {
              console.error('Error parsing products JSON:', err);
            }
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId ? { ...msg, text: msg.text + dataContent } : msg
              )
            );
          }
        }
      }
    } catch (error: any) {
      console.error('Streaming error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: 'Xin lỗi, đã xảy ra lỗi trong quá trình kết nối với trợ lý AI.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className="w-96 h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right"
          style={{
            backgroundColor: 'var(--surface-modal)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between shadow-md"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Trợ Lý Bán Hàng</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-ping"></span>
                  Trực tuyến | RAG Powered
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: 'var(--surface-raised)' }}
          >
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm"
                    style={
                      isAi
                        ? {
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                          }
                        : {
                            backgroundColor: '#4f46e5',
                            border: '1px solid #4338ca',
                            color: '#ffffff',
                          }
                    }
                  >
                    {isAi && msg.text === '' && isLoading && (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    )}
                    <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
                  </div>

                  {isAi && msg.products && msg.products.length > 0 && (
                    <div className="mt-2 w-full max-w-[90%] space-y-2">
                      <div
                        className="text-[11px] font-semibold px-1 flex items-center gap-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ShoppingBag className="h-3 w-3" style={{ color: '#6366f1' }} />
                        Sản phẩm liên quan:
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1.5">
                        {msg.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="flex-shrink-0 w-44 rounded-xl p-2.5 shadow-sm transition-colors cursor-pointer"
                            style={{
                              backgroundColor: 'var(--surface-card)',
                              border: '1px solid var(--border-default)',
                            }}
                          >
                            <div className="font-bold text-[12px] line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                              {prod.name}
                            </div>
                            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{prod.category}</div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[11px] font-bold" style={{ color: 'var(--text-danger)' }}>
                                {formatPrice(prod.price)}
                              </span>
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                                style={{
                                  backgroundColor: prod.stockQuantity > 0 ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                                  color: prod.stockQuantity > 0 ? 'var(--text-success)' : 'var(--text-danger)',
                                }}
                              >
                                {prod.stockQuantity > 0 ? `Còn ${prod.stockQuantity}` : 'Hết hàng'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 flex gap-2"
            style={{
              backgroundColor: 'var(--surface-modal)',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về sản phẩm..."
              disabled={isLoading}
              className="flex-1 rounded-xl px-3 py-1.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--surface-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl p-2 flex items-center justify-center shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
              }}
            >
              {isLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Send className="h-4.5 w-4.5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
            : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: '#ffffff',
        }}
        aria-label="Hỏi trợ lý AI"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
