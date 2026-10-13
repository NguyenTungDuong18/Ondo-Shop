import { Globe, Users, Plus, LogIn, Search } from 'lucide-react';
import type { useChatTestPage } from '../hooks/useChatTestPage';
type Props = { model: ReturnType<typeof useChatTestPage> };
export function ChatParticipants({ model: m }: Props) {
  const disabled = !m.isConnected || m.busy;
  const row = (target: string) => `w-full text-left px-3 py-3 rounded-xl text-sm transition-colors ${m.activeChatTarget === target ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]' : 'hover:bg-[var(--surface-overlay)]'}`;
  return <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-default)] bg-[var(--surface-raised)] flex flex-col max-h-[45vh] md:max-h-none">
    <div className="p-4 border-b border-[var(--border-default)] space-y-3">
      <div className="flex items-center gap-2 font-bold"><Users size={18} /> Cuộc trò chuyện <span className="ml-auto text-xs font-normal">{m.users.filter(x => x.isOnline).length} online</span></div>
      <label className="flex items-center gap-2"><Search size={16} /><input aria-label="Tìm người dùng" className="nike-input w-full px-3 py-2 text-sm" placeholder="Tìm người dùng..." value={m.search} onChange={e => m.setSearch(e.target.value)} /></label>
    </div>
    <div className="p-3 overflow-y-auto flex-1 space-y-2">
      <button className={row('General')} onClick={() => m.setActiveChatTarget('General')}><Globe className="inline mr-2" size={16} />Phòng chung</button>
      <h3 className="text-xs font-bold text-[var(--text-secondary)] px-3 pt-2">PHÒNG CHAT</h3>
      {m.rooms.map(room => <button key={room.id} className={row(`room:${room.id}`)} onClick={() => m.setActiveChatTarget(`room:${room.id}`)}># {room.name}</button>)}
      <form onSubmit={m.createRoom} className="flex gap-2">
        <input aria-label="Tên phòng mới" className="nike-input min-w-0 flex-1 p-2 text-sm" placeholder="Tên phòng mới" maxLength={80} value={m.roomName} onChange={e => m.setRoomName(e.target.value)} />
        <button title="Tạo phòng" aria-label="Tạo phòng" className="p-2 rounded-lg border border-[var(--border-default)] disabled:opacity-40" disabled={disabled || !m.roomName.trim()}><Plus size={18} /></button>
      </form>
      <form onSubmit={m.joinRoom} className="flex gap-2">
        <input aria-label="Mã tham gia phòng" className="nike-input min-w-0 flex-1 p-2 text-sm" placeholder="Nhập mã phòng 6 số" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" value={m.joinCode} onChange={e => m.setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        <button title="Vào phòng" aria-label="Vào phòng" className="p-2 rounded-lg border border-[var(--border-default)] disabled:opacity-40" disabled={disabled || m.joinCode.length !== 6}><LogIn size={18} /></button>
      </form>
      <p className="text-xs text-[var(--text-muted)] px-1">Mã tham gia có hiệu lực trong 5 phút.</p>
      <h3 className="text-xs font-bold text-[var(--text-secondary)] px-3 pt-4">NGƯỜI DÙNG</h3>
      {m.users.filter(x => x.id !== m.userId && x.username.toLowerCase().includes(m.search.toLowerCase())).map(user => {
        const friendship = m.friendship(user.id);
        const incoming = friendship && !friendship.accepted && friendship.recipientId === m.userId;
        return <div key={user.id} className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <button className={row(`user:${user.id}`)} onClick={() => m.setActiveChatTarget(`user:${user.id}`)}>
            <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full shrink-0 ${user.isOnline && m.isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} /><span className="truncate font-semibold">{user.username}</span></span>
            <span className="block text-xs mt-1 opacity-75">{user.isOnline && m.isConnected ? 'Đang hoạt động' : 'Offline'}{friendship?.accepted ? ' · Bạn bè' : ''}</span>
          </button>
          {!friendship && <button disabled={disabled} onClick={() => void m.act('RequestFriend', user.id)} className="text-xs px-3 py-2 font-semibold text-emerald-600 disabled:opacity-40">+ Kết bạn</button>}
          {friendship && !friendship.accepted && !incoming && <p className="px-3 pb-2 text-xs text-[var(--text-muted)]">Đã gửi lời mời kết bạn</p>}
          {incoming && <div className="px-3 pb-3 flex gap-3 text-xs"><button disabled={disabled} className="font-semibold text-emerald-600 disabled:opacity-40" onClick={() => void m.act('AcceptFriend', user.id)}>Chấp nhận</button><button disabled={disabled} className="disabled:opacity-40" onClick={() => void m.act('DeclineFriend', user.id)}>Từ chối</button></div>}
        </div>;
      })}
      {m.users.filter(x => x.id !== m.userId).length === 0 && <p className="px-3 py-4 text-xs text-[var(--text-muted)]">Chưa có người dùng khác tham gia chat.</p>}
    </div>
    <div className="px-4 py-3 border-t border-[var(--border-default)] text-sm font-semibold">@{m.username}</div>
  </aside>;
}
