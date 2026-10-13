import type { Product } from '../models/aiChat';
import type { ChatMessage, ChatState, ChatUser } from '../models/chat';
export interface ChatStreamObserver {
  onText(text: string): void;
  onProducts(products: Product[]): void;
}
export interface ChatEvents {
  ChatState: [state: ChatState];
  ParticipantsUpdated: [users: ChatUser[]];
  MessageReceived: [message: ChatMessage];
  RoomOpened: [roomId: string];
}
export interface ChatConnection {
  readonly state: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  invoke(method: string, ...args: string[]): Promise<void>;
  on<K extends keyof ChatEvents>(event: K, handler: (...args: ChatEvents[K]) => void): void;
  onreconnecting(handler: () => void): void;
  onreconnected(handler: () => void): void;
  onclose(handler: () => void): void;
}
export interface ChatRepository {
  createConnection(username: string): ChatConnection;
  streamAnswer(question: string, observer: ChatStreamObserver, signal?: AbortSignal): Promise<void>;
}
