import type { ReactNode } from 'react';
import { ChatContext, useChatSession } from '../hooks/useChatSession';
export function ChatProvider({ children }: { children: ReactNode }) {
  const session = useChatSession();
  return <ChatContext.Provider value={session}>{children}</ChatContext.Provider>;
}
