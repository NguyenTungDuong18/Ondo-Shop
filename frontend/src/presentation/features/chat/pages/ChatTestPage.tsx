import React from 'react';
import { ChatTestView } from '../components/ChatTestView';
import { useChatTestPage } from '../hooks/useChatTestPage';
export const ChatTestPage: React.FC = () => {
  const model = useChatTestPage();
  return <ChatTestView model={model} />;
};
