import React, { useEffect, useState, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../api/axiosClient';
import {
  Send,
  MessageSquare,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff,
  User,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface ChatMessage {
  sender: string;
  receiver?: string; // undefined = Public General Chat
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export const ChatTestPage: React.FC = () => {
  const { user: authUser } = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  // Connection state
  const [username, setUsername] = useState<string>(authUser?.username || '');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [connection, setConnection] = useState<HubConnection | null>(null);

  // Chat state
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatTarget, setActiveChatTarget] = useState<string>('General');
  const [messageText, setMessageText] = useState<string>('');

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, activeChatTarget]);

  const handleConnect = () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      addToast('error', 'Please enter a username to connect.');
      return;
    }

    setConnectionStatus('Connecting');

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat?username=${encodeURIComponent(cleanUsername)}`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        addToast('success', `Connected to Concierge as: ${cleanUsername}`);
      })
      .catch((err) => {
        console.error('SignalR error: ', err);
        setConnectionStatus('Disconnected');
        addToast('error', 'Unable to connect to SignalR server. Verify backend.');
      });

    newConnection.onreconnecting(() => {
      setConnectionStatus('Reconnecting');
    });

    newConnection.onreconnected(() => {
      setConnectionStatus('Connected');
      addToast('success', 'Restored WebSocket connection!');
    });

    newConnection.onclose(() => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      addToast('info', 'Disconnected from WebSocket.');
    });

    newConnection.on('ReceiveMessage', (sender: string, text: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages((prev) => [...prev, { sender, text, timestamp }]);
    });

    newConnection.on('ReceivePrivateMessage', (sender: string, receiver: string, text: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages((prev) => [...prev, { sender, receiver, text, timestamp }]);
    });

    newConnection.on('ReceiveSystemMessage', (text: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages((prev) => [...prev, { sender: 'System', text, timestamp, isSystem: true }]);
    });

    newConnection.on('UserListUpdated', (users: string[]) => {
      setOnlineUsers(users);
    });
  };

  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (!connection || connection.state !== HubConnectionState.Connected) {
      addToast('error', 'WebSocket connection not ready.');
      return;
    }

    try {
      if (activeChatTarget === 'General') {
        await connection.invoke('SendMessage', username, messageText);
      } else {
        await connection.invoke('SendPrivateMessage', activeChatTarget, messageText);
      }
      setMessageText('');
    } catch (err) {
      console.error('Send error: ', err);
      addToast('error', 'Failed to send message.');
    }
  };

  useEffect(() => {
    if (activeChatTarget !== 'General' && !onlineUsers.some(u => u.toLowerCase() === activeChatTarget.toLowerCase())) {
      addToast('info', `Member '${activeChatTarget}' is offline.`);
      setActiveChatTarget('General');
    }
  }, [onlineUsers, activeChatTarget, addToast]);

  const filteredMessages = messages.filter((msg) => {
    if (msg.isSystem) return true;

    if (activeChatTarget === 'General') {
      return msg.receiver === undefined;
    } else {
      return (
        (msg.sender.toLowerCase() === username.toLowerCase() && msg.receiver?.toLowerCase() === activeChatTarget.toLowerCase()) ||
        (msg.sender.toLowerCase() === activeChatTarget.toLowerCase() && msg.receiver?.toLowerCase() === username.toLowerCase())
      );
    }
  });

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'Connected':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500 animate-pulse', icon: Wifi, label: 'CONNECTED' };
      case 'Connecting':
      case 'Reconnecting':
        return { bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500 animate-ping', icon: RefreshCw, label: connectionStatus.toUpperCase() };
      case 'Disconnected':
      default:
        return { bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', icon: WifiOff, label: 'OFFLINE' };
    }
  };

  const statusConfig = getStatusConfig();

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in py-12">
        <div className="bg-[var(--surface-card)] p-8 rounded-3xl border border-[var(--border-default)] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-[var(--text-primary)]" />
          </div>

          <div className="space-y-2">
            <h2 className="nike-title text-xl text-[var(--text-primary)] tracking-wider">ONDA CONCIERGE</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">Enter your handle to join the live studio room.</p>
          </div>

          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 pl-2">Member Handle</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="nike-input w-full px-5 py-3 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleConnect}
              disabled={connectionStatus === 'Connecting'}
              icon={connectionStatus === 'Connecting' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-emerald-400" />}
            >
              {connectionStatus === 'Connecting' ? 'Connecting...' : 'Connect Live Channel'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-default)] shadow-xl overflow-hidden flex flex-col md:flex-row h-[600px]">

        {/* LEFT PANEL */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--border-default)] flex flex-col bg-[var(--surface-raised)] shrink-0">
          <div className="p-5 border-b border-[var(--border-default)] bg-[var(--surface-card)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--text-primary)]" />
              <span className="nike-title text-xs text-[var(--text-primary)] tracking-wider">ONLINE ({onlineUsers.length})</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold ${statusConfig.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              <span>{statusConfig.label}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              onClick={() => setActiveChatTarget('General')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeChatTarget === 'General'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Globe className={`w-4 h-4 ${activeChatTarget === 'General' ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`} />
              <span className="uppercase tracking-tight text-left">General Room</span>
            </button>

            <div className="border-t border-[var(--border-default)] my-2 pt-2">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider px-4 mb-2">Online Members</p>
            </div>

            {onlineUsers.filter(u => u.toLowerCase() !== username.toLowerCase()).length === 0 ? (
              <p className="text-[11px] text-[var(--text-secondary)] text-center py-6 font-medium italic">No other members online.</p>
            ) : (
              onlineUsers
                .filter(u => u.toLowerCase() !== username.toLowerCase())
                .map((userOnline) => (
                  <button
                    key={userOnline}
                    onClick={() => setActiveChatTarget(userOnline)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      activeChatTarget === userOnline
                        ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-md'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span>{userOnline}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </button>
                ))
            )}
          </div>

          <div className="p-4 border-t border-[var(--border-default)] bg-[var(--surface-card)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--btn-primary-bg)] flex items-center justify-center text-[var(--btn-primary-text)] font-black text-xs shadow-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-[var(--text-primary)] leading-tight">Active handle</p>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">@{username}</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col bg-[var(--surface-card)]">
          <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {activeChatTarget === 'General' ? (
                <>
                  <Globe className="w-5 h-5 text-[var(--text-primary)] animate-spin-slow" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] leading-tight">General Room</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Public channel visible to all members</p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] leading-tight">Concierge with {activeChatTarget}</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold">1-to-1 encrypted conversation</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--surface-raised)]">
            {filteredMessages.length === 0 ? (
              <div className="m-auto text-center space-y-2 max-w-sm py-20">
                <div className="w-12 h-12 bg-[var(--surface-card)] rounded-full flex items-center justify-center mx-auto border border-[var(--border-default)] shadow-xs">
                  <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">No messages yet</p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {activeChatTarget === 'General'
                    ? 'Send the first message to start the conversation.'
                    : `Send a private message to ${activeChatTarget}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg, index) => {
                  if (msg.isSystem) {
                    return (
                      <div key={index} className="flex justify-center my-2">
                        <span className="bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                          📢 {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender.toLowerCase() === username.toLowerCase();
                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-bold px-2 mb-0.5">
                        <span>{isMe ? 'You' : msg.sender}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words border font-medium ${
                          isMe
                            ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-border)] rounded-tr-none shadow-sm'
                            : 'bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-default)] rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-default)] flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${activeChatTarget === 'General' ? 'General Room' : activeChatTarget}...`}
              className="nike-input flex-1 px-5 py-3.5 text-sm"
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!messageText.trim()}
              className="shrink-0"
              icon={<Send className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>

        </div>

      </div>
    </div>
  );
};
