import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChatSessionContext } from './useChatSession';
import { useAuthStore } from '../../../state/authStore';
import { useUIStore } from '../../../state/uiStore';

export function useChatTestPage() {
  const session = useChatSessionContext();
  const user = useAuthStore(state => state.user);
  const addToast = useUIStore(state => state.addToast);
  const [messageText, setMessageText] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [now, setNow] = useState(Date.now());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeChatTarget = session?.activeChatTarget ?? 'General';
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const container = messagesContainerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [session?.messages, activeChatTarget]);
  const act = async (method: string, ...args: string[]) => {
    if (busyRef.current || !session) return false;
    busyRef.current = true;
    setBusy(true);
    try { await session.invoke(method, ...args); return true; }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Không thực hiện được thao tác.';
      addToast('error', message.split('HubException: ').pop() ?? message);
      return false;
    } finally { busyRef.current = false; setBusy(false); }
  };
  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = messageText.trim();
    if (text && await act('SendMessage', activeChatTarget, text)) setMessageText('');
  };
  const createRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (await act('CreateRoom', roomName.trim())) setRoomName('');
  };
  const joinRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (await act('JoinRoom', joinCode)) setJoinCode('');
  };
  const users = session?.users ?? [];
  const rooms = session?.rooms ?? [];
  const friends = session?.friends ?? [];
  const activeUser = users.find(x => `user:${x.id}` === activeChatTarget);
  const activeRoom = rooms.find(x => `room:${x.id}` === activeChatTarget);
  const friendship = (id: string) => friends.find(x => (x.requesterId === user?.id && x.recipientId === id) || (x.recipientId === user?.id && x.requesterId === id));
  const filteredMessages = (session?.messages ?? []).filter(msg => {
    if (activeChatTarget === 'General') return !msg.receiverId && !msg.roomId;
    if (activeRoom) return msg.roomId === activeRoom.id;
    return !!activeUser && !msg.roomId && ((msg.senderId === user?.id && msg.receiverId === activeUser.id) || (msg.senderId === activeUser.id && msg.receiverId === user?.id));
  });
  return {
    username: user?.username ?? '', userId: user?.id, users, rooms, friends, friendship,
    activeChatTarget, setActiveChatTarget: session?.setActiveChatTarget ?? (() => {}), activeUser, activeRoom,
    isConnected: session?.status === 'Connected', connectionStatus: session?.status ?? 'Disconnected', error: session?.error,
    messageText, setMessageText, messagesContainerRef, filteredMessages, handleSendMessage,
    roomName, setRoomName, joinCode, setJoinCode, createRoom, joinRoom, search, setSearch, busy, act, now,
    canMessage: activeChatTarget === 'General' || !!activeRoom || (!!activeUser && friendship(activeUser.id)?.accepted === true),
  };
}
