import type { useChatTestPage } from '../hooks/useChatTestPage';
import { ChatConversation } from './ChatConversation';
import { ChatParticipants } from './ChatParticipants';
import { getChatStatusConfig } from '../config/chatStatus';
export function ChatTestView({ model }: { model: ReturnType<typeof useChatTestPage> }) {
  const status = getChatStatusConfig(model.connectionStatus);
  return <div className="max-w-6xl mx-auto space-y-4 pb-8">
    <div className="flex items-center justify-between gap-3"><h1 className="text-xl font-bold">Chat trực tuyến</h1><span className="text-xs flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${status.dot}`} />{status.label}</span></div>
    {!model.isConnected && <p role="status" className="text-sm text-[var(--text-secondary)]">{model.error || 'Đang kết nối với máy chủ chat...'}</p>}
    <div className="rounded-3xl border border-[var(--border-default)] shadow-xl overflow-hidden flex flex-col md:flex-row h-[780px] md:h-[680px]">
      <ChatParticipants model={model} />
      <ChatConversation model={model} />
    </div>
  </div>;
}
