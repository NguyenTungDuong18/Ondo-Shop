import { MessageSquare, Send } from 'lucide-react';
import type { useChatTestPage } from '../hooks/useChatTestPage';
type Props = { model: ReturnType<typeof useChatTestPage> };
export function ChatConversation({ model: m }: Props) {
  const title = m.activeRoom?.name ?? m.activeUser?.username ?? 'Phòng chung';
  const inviteSeconds = m.activeRoom ? Math.max(0, Math.ceil((Date.parse(m.activeRoom.inviteExpiresAt) - m.now) / 1000)) : 0;
  return <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-[var(--surface-card)]">
    <header className="p-5 border-b border-[var(--border-default)] space-y-2">
      <h2 className="font-bold flex items-center gap-2">{m.activeUser && <span className={`w-2.5 h-2.5 rounded-full ${m.activeUser.isOnline && m.isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />}{title}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{m.activeUser ? (m.activeUser.isOnline && m.isConnected ? 'Đang hoạt động' : 'Offline') : 'Lịch sử trò chuyện được lưu lại.'}</p>
      {m.activeRoom && <div className="rounded-xl bg-[var(--surface-raised)] px-3 py-2 text-sm">
        {inviteSeconds > 0 ? <>Mã tham gia: <strong className="font-mono tracking-widest select-all">{m.activeRoom.inviteCode}</strong><span className="ml-2 text-xs text-[var(--text-secondary)]">Còn {Math.floor(inviteSeconds / 60)}:{String(inviteSeconds % 60).padStart(2, '0')}</span></> : <span className="text-[var(--text-secondary)]">Mã tham gia đã hết hạn. Phòng vẫn tiếp tục hoạt động.</span>}
      </div>}
    </header>
    <div ref={m.messagesContainerRef} role="log" aria-label="Tin nhắn" className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--surface-raised)]">
      {m.filteredMessages.length === 0 && <div className="py-16 text-center text-[var(--text-muted)]"><MessageSquare className="mx-auto mb-3" /><p className="text-sm">Chưa có tin nhắn.</p></div>}
      {m.filteredMessages.map(msg => {
        const isMe = msg.senderId === m.userId;
        return <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div className="text-[11px] text-[var(--text-muted)] mb-1">{isMe ? 'Bạn' : msg.sender} · {new Date(msg.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
          <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-tr-none' : 'bg-[var(--surface-card)] border border-[var(--border-default)] rounded-tl-none'}`}>{msg.text}</div>
        </div>;
      })}
    </div>
    {!m.canMessage ? <p className="p-5 text-sm text-[var(--text-secondary)] border-t border-[var(--border-default)]">Hãy gửi hoặc chấp nhận lời mời kết bạn để bắt đầu chat riêng.</p> :
      <form onSubmit={m.handleSendMessage} className="p-4 border-t border-[var(--border-default)] flex gap-3">
        <input aria-label="Nội dung tin nhắn" value={m.messageText} maxLength={4000} onChange={e => m.setMessageText(e.target.value)} placeholder={`Nhắn tin đến ${title}...`} className="nike-input min-w-0 flex-1 px-4 py-3 text-sm" />
        <button type="submit" aria-label="Gửi tin nhắn" disabled={!m.isConnected || m.busy || !m.messageText.trim()} className="px-4 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] disabled:opacity-40"><Send size={18} /></button>
      </form>}
  </section>;
}
