import React, { useEffect, useRef, useState } from 'react';
import { chatService } from '../../../../application/services/chatService';
import { session } from '../../../../application/services/session';
import { type Message } from '../../../../domain/models/aiChat';
import { formatVND as formatCurrency } from '../../../../shared/format/currency';
export function useFloatingAiChat() {

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

  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

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

    const token = session.getToken();
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

    const controller = new AbortController();
    requestRef.current = controller;
    try {
      await chatService.streamAnswer(userText, {
        onText: text => setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: msg.text + text } : msg)),
        onProducts: products => setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, products } : msg)),
      }, controller.signal);
    } catch (error: any) {
      if (controller.signal.aborted) return;
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

  const formatPrice = formatCurrency;
  return { isOpen, setIsOpen, messages, input, setInput, isLoading, messagesEndRef, handleSend, formatPrice };
}
