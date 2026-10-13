import { HubConnectionBuilder } from '@microsoft/signalr';
import type { ChatRepository } from '../../domain/repositories/ChatRepository';
import { API_BASE_URL } from '../../shared/config/environment';
import { sessionRepository } from '../auth/sessionRepository';
import { createChatStreamParser } from './streamParser';
export const chatRepository: ChatRepository = {
  createConnection: () => new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, { accessTokenFactory: () => sessionRepository.getToken() ?? '' }).withAutomaticReconnect().build(),
  async streamAnswer(question, observer, signal) {
    const token = sessionRepository.getToken();
    if (!token) throw new Error('Authentication required');
    const response = await fetch(`${API_BASE_URL}/api/v1/RagChat/AskStream`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question }), signal,
    });
    if (!response.ok || !response.body) throw new Error('Chat stream unavailable');
    const reader = response.body.getReader(), decoder = new TextDecoder(), parser = createChatStreamParser(observer);
    try {
      while (true) { const { value, done } = await reader.read(); if (done) break; parser.push(decoder.decode(value, { stream: true })); }
      parser.push(decoder.decode()); parser.finish();
    } finally { reader.releaseLock(); }
  },
};
