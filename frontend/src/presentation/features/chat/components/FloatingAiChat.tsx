import React from 'react';
import { useFloatingAiChat } from '../hooks/useFloatingAiChat';
import { FloatingAiChatView } from './FloatingAiChatView';
export const FloatingAiChat: React.FC = () => {
  const model = useFloatingAiChat();
  return <FloatingAiChatView model={model} />;
};
