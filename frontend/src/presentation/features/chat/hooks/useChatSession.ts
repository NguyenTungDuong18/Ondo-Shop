import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { chatService } from '../../../../application/services/chatService';
import type { ChatState } from '../../../../domain/models/chat';
import type { ChatConnection } from '../../../../domain/repositories/ChatRepository';
import { useAuthStore } from '../../../state/authStore';

const emptyState: ChatState = { users: [], rooms: [], friends: [], messages: [] };
export function useChatSession() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id;
  const username = user?.username;
  const [state, setState] = useState<ChatState>(emptyState);
  const [status, setStatus] = useState('Disconnected');
  const [error, setError] = useState('');
  const [activeChatTarget, setActiveChatTarget] = useState('General');
  const connection = useRef<ChatConnection | null>(null);
  useEffect(() => {
    setState(emptyState);
    setActiveChatTarget('General');
    setStatus('Disconnected');
    setError('');
    if (!userId || !username) return;
    let disposed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const client = chatService.createConnection(username);
    connection.current = client;
    client.on('ChatState', next => { if (!disposed) setState(next); });
    client.on('ParticipantsUpdated', users => { if (!disposed) setState(prev => ({ ...prev, users })); });
    client.on('MessageReceived', message => {
      if (!disposed) setState(prev => ({ ...prev, messages: prev.messages.some(x => x.id === message.id) ? prev.messages : [...prev.messages, message] }));
    });
    client.on('RoomOpened', id => { if (!disposed) setActiveChatTarget(`room:${id}`); });
    const start = async () => {
      if (disposed) return;
      setStatus('Connecting');
      try {
        await client.start();
        if (!disposed) { setStatus('Connected'); setError(''); }
      } catch {
        if (!disposed) {
          setStatus('Disconnected');
          setError('Chưa kết nối được máy chủ chat. Hệ thống sẽ tự thử lại.');
          retry = setTimeout(start, 5000);
        }
      }
    };
    client.onreconnecting(() => { if (!disposed) setStatus('Reconnecting'); });
    client.onreconnected(() => { if (!disposed) { setStatus('Connected'); setError(''); } });
    client.onclose(() => {
      if (!disposed) { setStatus('Disconnected'); retry = setTimeout(start, 5000); }
    });
    void start();
    return () => { disposed = true; clearTimeout(retry); connection.current = null; void client.stop(); };
  }, [userId, username]);
  const invoke = async (method: string, ...args: string[]) => {
    if (connection.current?.state !== 'Connected') throw new Error('Đang mất kết nối. Vui lòng đợi kết nối lại.');
    await connection.current.invoke(method, ...args);
  };
  return { ...state, status, error, invoke, activeChatTarget, setActiveChatTarget };
}
export const ChatContext = createContext<ReturnType<typeof useChatSession> | null>(null);
export const useChatSessionContext = () => useContext(ChatContext);