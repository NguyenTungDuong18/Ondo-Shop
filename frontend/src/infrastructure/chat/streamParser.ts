import type { Product } from '../../domain/models/aiChat';
import type { ChatStreamObserver } from '../../domain/repositories/ChatRepository';
/** Incremental parser for the backend's line-based data protocol. */
export function createChatStreamParser(observer: ChatStreamObserver) {
  let buffer = '';
  function consume(line: string) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) return;
    const content = trimmed.slice(5).trim();
    if (!content || content === '[DONE]') return;
    if (content.startsWith('[PRODUCTS]:')) {
      try {
        const products: unknown = JSON.parse(content.slice(11));
        if (Array.isArray(products)) observer.onProducts(products as Product[]);
      } catch { /* Ignore malformed product events; subsequent text remains usable. */ }
    } else observer.onText(content);
  }
  return {
    push(chunk: string) { buffer += chunk; const lines = buffer.split('\n'); buffer = lines.pop() || ''; lines.forEach(consume); },
    finish() { if (buffer) consume(buffer); buffer = ''; },
  };
}
